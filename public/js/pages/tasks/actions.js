//cập nhật nhanh priority, gọi hàm updatefield của taskcontroller
async function updateInline(taskId, field, value, label) {
    const response = await fetch(`/tasks/${taskId}/update-field`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken()
        },
        body: JSON.stringify({ field, value })
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success || field !== 'priority') return;

    document.querySelectorAll(`[data-role="task"][data-task-id="${CSS.escape(String(taskId))}"]`).forEach((record) => {
        const badge = record.querySelector('.task-priority-pill'); //màu
        const textSpan = record.querySelector('[id^="priority-text-"], .task-priority-text'); //text

        //đổi chữ hiển thị
        if (textSpan) textSpan.innerText = label;
        //đổi màu badge
        if (badge) {
            //cập nhật class
            badge.className = `badge task-priority-pill task-priority-${value} px-3 py-2 rounded-pill fw-semibold border w-100 text-start d-flex justify-content-between align-items-center`;
        }
        //cập nhật data-priority
        record.dataset.priority = value;
    });

    //nếu có hàm reload bàng ajax thì gọi
    if (typeof window.reloadTaskListAjax === 'function') {
        await window.reloadTaskListAjax(false);
    }
}

//mở modal sửa task
//sourceElement: nút hoặc phần tử user vừa bấm, ví dụ nút sửa trong task card
function openEditTaskModal(taskId, sourceElement = null) {

    //tìm task tương ứng, nếu có sourceElement thì đi ngược lên task cha gần nhất
    const row = sourceElement?.closest('[data-role="task"][data-task-id]')
        //nếu không có, tìm theo id dạng row desktop
        || document.getElementById(`task-row-${taskId}`)
        //nếu vẫn không có, tìm theo id dạng card mobile
        || document.getElementById(`task-card-${taskId}`);

    //lấy modal sửa task
    const modalElement = document.getElementById('editTaskModal');
    if (!row || !modalElement) return;

    //gắn id task vào input ẩn
    document.getElementById('editTaskId').value = taskId;
    //lấy title từ data-title rồi đưa vào input title
    document.getElementById('editTaskTitle').value = row.dataset.title || '';
    //lấy priority hiện tại từ data-priority, không có thì mặc định là med
    document.getElementById('editTaskPriority').value = row.dataset.priority || 'med';

    //lấy input due date trong modal
    const dueDateInput = document.getElementById('editTaskDueDate');
    //nếu có, set bằng data-due-date của task
    if (dueDateInput) dueDateInput.value = row.dataset.dueDate || '';

    //ẩn box lỗi
    document.getElementById('editTaskError')?.classList.add('d-none');
    //mở bootstrap modal
    bootstrap.Modal.getOrCreateInstance(modalElement).show();
}

//cập nhật nhanh deadline
function updateDueDate(taskId, value) {
    //gọi api updatefield
    return fetch(`/tasks/${taskId}/update-field`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken()
        },
        body: JSON.stringify({ field: 'due_date', value })
    }).then(res => res.json()); //sau khi server trả lời, đọc response thành json
}

//bắt mọi click có data-action rồi gọi hàm tương ứng
document.addEventListener('click', function (event) {
    //event.target là phần user bấm vào, từ chỗ user bấm, tìm phần từ gần nhất có data-action
    //ví dụ bấm trúng thẻ <i> nhưng closest('data-action) sẽ tìm ngược lên button có data-action
    const el = event.target.closest('[data-action]');
    if (!el) return; //nếu không tìm thấy thì dừng

    //đọc giá trị data-action
    switch (el.dataset.action) {
        //2 nút chuyển ngày tới/lui trong daily task
        case 'shift-daily':
            //gọi tới hàm trong tasks.js
            shiftDailyDate(Number(el.dataset.delta || 0));
            break;
        //nút hôm nay trong daily task
        case 'go-today':
            //tasks.js
            goToday();
            break;
        //chọn 1 tag trong dropdown
        case 'update-tag':
            //chặn thẻ <a href="#"> nhảy trang
            event.preventDefault();
            //tags.js
            updateTag(el.dataset.taskId, el.dataset.tagName || '');
            break;
        //tạo tag mới
        case 'prompt-new-tag':
            //nếu có task id, mở modal tạo tag
            //tags.js
            if (el.dataset.taskId) promptNewTag(el.dataset.taskId);
            break;
        //nút sửa tag trong dropdown
        case 'prompt-edit-tag':
            //chặn hành vi mặc định
            event.preventDefault();
            //chặn click lan ra ngoài, nếu không chặn, click có thể bị hiểu là đang click chọn tag
            event.stopPropagation();
            //nếu có tag id, mở modal sửa tag
            if (el.dataset.tagId) renameTag(el.dataset.tagId, el.dataset.tagName || '');
            break;
        //nút xóa tag, tương tự sửa tag
        case 'delete-tag':
            event.preventDefault();
            event.stopPropagation();
            if (el.dataset.tagId) deleteTag(el.dataset.tagId, el.dataset.tagName || '');
            break;
        //cập nhật nhanh field priority
        case 'update-inline':
            event.preventDefault();
            updateInline(el.dataset.taskId, el.dataset.field, el.dataset.value, el.dataset.label || '');
            break;
        //nút sửa task
        case 'open-edit-task':
            //nếu có task id, mở modal sửa task
            //truyền thêm el để hàm tìm task cha gần nhất và lấy dữ liệu hiện tại
            if (el.dataset.taskId) openEditTaskModal(el.dataset.taskId, el);
            break;
    }
});

