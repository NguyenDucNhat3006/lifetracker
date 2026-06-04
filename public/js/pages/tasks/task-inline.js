document.addEventListener('DOMContentLoaded', () => {
    //tìm tất cả phiên bản hiển thị của 1 task trên giao diện, vì mobile hiện card, desktop hiện row
    function findTaskRecords(taskId) {
        return document.querySelectorAll(`[data-role="task"][data-task-id="${CSS.escape(String(taskId))}"]`);
    }

    //chuyển check box về trạng thái cũ nếu cập nhật status thất bại
    function revertCheckbox(checkbox) {
        checkbox.checked = !checkbox.checked;
    }

    //lưu deadline cũ
    //lưu để nếu đổi deadline thất bại thì có thể khôi phục
    //focusin xảy ra khi 1 input được focus
    document.addEventListener('focusin', (event) => {
        const target = event.target;
        //kiểm tra có phải input không, và có class task-deadline-input không
        if (target instanceof HTMLInputElement && target.classList.contains('task-deadline-input')) {
            //lưu giá trị deadline cũ vào data-prev-value
            target.dataset.prevValue = target.value;
        }
    });

    //bắt mọi sự kiện change, chỉ xử lý nếu phần tử thay đổi là input
    //dùng để xử lý input date đổi giá trị, checkbox đổi pending/done
    document.addEventListener('change', async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement)) return;

        //đổi deadline
        if (target.classList.contains('task-deadline-input')) {
            const taskId = target.dataset.taskId;
            if (!taskId) return;

            try {
                //actions.js
                const data = await updateDueDate(taskId, target.value || '');
                if (!data?.success) throw new Error('update failed');

                //update thành công thì tìm tất cả bản hiển thị của task đó rồi cập nhật
                findTaskRecords(taskId).forEach((record) => {
                    record.dataset.dueDate = target.value || '';
                });
            } catch {
                //lỗi thì trả về deadline cũ (đã được lưu lúc focus vào input)
                target.value = target.dataset.prevValue || '';
            }
            return;
        }

        //đổi status done/pending
        if (target.classList.contains('task-status-checkbox')) {
            const taskId = target.dataset.taskId;
            //tìm element task tương ứng với checkbox
            const rowElement = target.closest('[data-role="task"][data-task-id]') //đi ngược lên cha gần nhất
                || document.getElementById(`task-row-${taskId}`) //không tìm thấy thì tìm theo id row
                || document.getElementById(`task-card-${taskId}`); //vẫn không thấy thì tìm theo id card
            if (!taskId || !rowElement) return;

            try {
                const response = await fetch(rowElement.dataset.updateStatusUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken()
                    },
                    body: JSON.stringify({ status: target.checked ? 'done' : 'pending' })
                });

                if (!response.ok) {
                    //nếu không thành không thì quay lại trạng thái cũ
                    revertCheckbox(target);
                    return;
                }

                //nếu thành công thì tìm tất cả checkbox cùng task id và cập nhật
                document.querySelectorAll(`.task-status-checkbox[data-task-id="${CSS.escape(String(taskId))}"]`).forEach((checkbox) => {
                    checkbox.checked = target.checked;
                });
            } catch {
                //lỗi thì quay lại trạng thái cũ
                revertCheckbox(target);
            }
        }
    });
});
