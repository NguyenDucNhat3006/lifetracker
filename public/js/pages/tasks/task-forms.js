document.addEventListener('DOMContentLoaded', () => {
    //hiện box lỗi
    function showError(errorBox) {
        errorBox?.classList.remove('d-none');
    }

    //ẩn box lỗi
    function hideError(errorBox) {
        errorBox?.classList.add('d-none');
    }

    //đóng modal theo id
    function hideModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (modalElement) bootstrap.Modal.getOrCreateInstance(modalElement).hide();
    }

    //đọc json từ responsive
    async function readJsonResponse(response) {
        const data = await response.json().catch(() => null);
        return { data, success: response.ok && data?.success };
    }

    //gán lại hidden view và date sau khi gọi reset()
    function restoreAddTaskHiddenFields(form) {
        const viewInput = form.querySelector('input[name="view"]');
        const dateInput = form.querySelector('input[name="date"]');

        if (viewInput) viewInput.value = getCurrentTaskView();
        if (dateInput) dateInput.value = getCurrentDailyDate();
    }

    //reload danh sách task bằng ajax
    async function reloadTaskList() {
        if (typeof window.reloadTaskListAjax === 'function') {
            await window.reloadTaskListAjax(false);
        }
    }

    //submit form thêm task
    document.getElementById('addTaskForm')?.addEventListener('submit', async function (event) {
        event.preventDefault();

        //lấy form và box lỗi
        const form = event.currentTarget; //form đang submit
        const errorBox = document.getElementById('addTaskError');
        hideError(errorBox);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken()
                },
                body: new FormData(form)
            });
            const { success } = await readJsonResponse(response);

            if (!success) {
                showError(errorBox);
                return;
            }

            await reloadTaskList();
            form.reset(); //xóa dữ liệu vừa nhập trong form
            restoreAddTaskHiddenFields(form);
            hideModal('addTaskModal');
        } catch {
            showError(errorBox);
        }
    });

    //submit form sửa task
    document.getElementById('editTaskForm')?.addEventListener('submit', async function (event) {
        event.preventDefault();

        const taskId = document.getElementById('editTaskId')?.value; //id đang sửa
        const title = document.getElementById('editTaskTitle')?.value.trim(); //tên task mới
        const priority = document.getElementById('editTaskPriority')?.value || 'med'; //priority mới
        const dueDateInput = document.getElementById('editTaskDueDate'); //deadline
        const errorBox = document.getElementById('editTaskError'); //box lỗi của modal sửa

        if (!taskId || !title) return;
        hideError(errorBox);

        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken()
                },
                body: JSON.stringify({
                    title,
                    priority,
                    due_date: dueDateInput ? dueDateInput.value || null : null,
                    view: getCurrentTaskView(),
                    date: getCurrentDailyDate()
                })
            });
            const { success } = await readJsonResponse(response);

            if (!success) {
                showError(errorBox);
                return;
            }

            await reloadTaskList();
            hideModal('editTaskModal');
        } catch {
            showError(errorBox);
        }
    });

    //submit form xóa task
    //bắt mọi submit trên trang, chỉ xử lý clas ajax-delete-task-form
    document.addEventListener('submit', async function (event) {
        const form = event.target.closest('.ajax-delete-task-form');
        if (!form) return;

        event.preventDefault();

        try {
            const response = await fetch(form.action, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken()
                }
            });
            const { success } = await readJsonResponse(response);

            if (success) await reloadTaskList();
        } catch {
        }
    });
});
