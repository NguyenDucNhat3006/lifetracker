//tạo html cho task trong dropdown
function buildTaskTagOption(tag) {
    if (!tag?.id || !tag?.name) return ''; //tránh lỗi tag null/undefined

    //escape dữ liệu trước khi đưa vào html
    const id = escapeTaskHtml(tag.id);
    const name = escapeTaskHtml(tag.name);

    //data-task-id ban đầu để rỗng, sau đó normalizeTaskTagMenus() sẽ điền task id đúng
    //li đại diện cho 1 lựa chọn trong dropdown
    return `
        <li class="task-tag-option-row d-flex align-items-center gap-1 px-2" data-tag-option-id="${id}">
            <a class="dropdown-item small fw-medium text-muted rounded-2 flex-grow-1 d-flex align-items-center" href="#"
                data-action="update-tag" data-task-id="" data-tag-name="${name}">
                <span class="text-truncate">${name}</span>
            </a>
            <button type="button" class="btn btn-sm task-tag-manage-btn text-muted p-0 d-inline-flex align-items-center justify-content-center rounded-2"
                data-action="prompt-edit-tag" data-tag-id="${id}" data-tag-name="${name}" title="Sửa tag">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="btn btn-sm task-tag-manage-btn text-danger p-0 d-inline-flex align-items-center justify-content-center rounded-2"
                data-action="delete-tag" data-tag-id="${id}" data-tag-name="${name}" title="Xóa tag">
                <i class="fa-solid fa-trash"></i>
            </button>
        </li>
    `;
}

//chuẩn hóa menu tag
function normalizeTaskTagMenus() {
    //duyệt từng dropdown
    //menu đại diện cho dropdown
    document.querySelectorAll('.task-tag-menu').forEach((menu) => {
        menu.querySelectorAll('[data-action="update-tag"]').forEach((link) => {
            //tìm task chứa link (link là tag trong dropdown)
            const record = link.closest('[data-role="task"][data-task-id]');
            //nếu tìm được thì gán task id vào task id của link
            if (record) link.dataset.taskId = record.dataset.taskId || '';
        });

        if (menu.querySelector('.task-tag-option-row')) {
            //nếu có tag thì xóa "chưa có tag nào" nếu đang tồn tại
            menu.querySelector('.task-tag-empty-item')?.remove();
        } else if (!menu.querySelector('.task-tag-empty-item')) {
            //nếu không có tag và chưa có dòng empty thì thêm dòng empty
            menu.insertAdjacentHTML('beforeend', '<li class="task-tag-empty-item"><span class="dropdown-item small text-muted fst-italic">Chưa có tag nào</span></li>');
        }
    });
}

//thêm tag mới vào tất cả dropdown
function addTaskTagToMenus(tag) {
    document.querySelectorAll('.task-tag-menu').forEach((menu) => {
        //nếu tag thiếu id/name hoặc menu đã có tag này rồi thì bỏ qua
        if (!tag?.id || !tag?.name || menu.querySelector(`[data-tag-option-id="${CSS.escape(String(tag.id))}"]`)) return;
        //nếu đang có dòng empty thì xóa
        menu.querySelector('.task-tag-empty-item')?.remove();
        //thêm html của tag mới vào cuối menu
        menu.insertAdjacentHTML('beforeend', buildTaskTagOption(tag));
    });

    //chuẩn hóa lại menu để điền đúng task id
    normalizeTaskTagMenus();
}

//đổi tên tag trong tất cả dropdown
function renameTaskTagInMenus(tagId, nextName) {
    //tìm tất cả tag có id tương ứng
    document.querySelectorAll(`[data-tag-option-id="${CSS.escape(String(tagId))}"]`).forEach((item) => {
        //đổi data-tag-name
        item.querySelectorAll('[data-tag-name]').forEach((el) => {
            el.dataset.tagName = nextName;
        });

        //đổi tên hiển thị
        const label = item.querySelector('.text-truncate');
        if (label) label.textContent = nextName;
    });
}

//xóa tag khỏi tất cả dropdown
function removeTaskTagFromMenus(tagId) {
    //tìm tag có id cần xóa trong mọi dropdown, xóa từng dòng khỏi html
    document.querySelectorAll(`[data-tag-option-id="${CSS.escape(String(tagId))}"]`).forEach((item) => item.remove());
    normalizeTaskTagMenus();
}

//cập nhật tag đang hiển thị ở các task đang dùng tag đó
function updateRowsUsingTag(oldName, nextName) {
    //tìm tất cả task, mỗi task = 1 record
    document.querySelectorAll('[data-role="task"][data-task-id]').forEach((record) => {
        //nếu task đó đang không dùng task được sửa thì bỏ qua
        if ((record.dataset.tag || '') !== oldName) return;

        //cập nhật data-tag thành tên mới, nếu tên mới rỗng thì lưu ''
        record.dataset.tag = nextName || '';

        //tìm phần tử có id bắt đầu bằng tag-text- hoặc phần tử có class task-tag-text
        const tagText = record.querySelector('[id^="tag-text-"], .task-tag-text');
        //nếu là đổi tên task thì hiện tên mới, xóa tag thì hiện '---'
        if (tagText) tagText.textContent = nextName || '---';
    });
}

//gắn tag cho task bằng API
async function updateTag(taskId, newTag) {
    //nếu tag rỗng thì trả về null
    if (!newTag || newTag.trim() === '') return null;

    //gửi request lên server
    const response = await fetch(`/tasks/${taskId}/update-field`, {
        method: 'PATCH', //cập nhật 1 phần
        headers: {
            'Content-Type': 'application/json', //gửi json
            'Accept': 'application/json', //muốn server trả json
            'X-CSRF-TOKEN': csrfToken() //token bảo mật
        },
        //gửi dữ liệu cho taskcontroller hàm updatefield
        body: JSON.stringify({ field: 'tag', value: newTag.trim() })
    });

    //đọc json server trả về, nếu parse lỗi thì trả về null
    const data = await response.json().catch(() => null);
    //nếu lỗi hiện alert
    if (!response.ok || !data?.success) {
        alert('Không thể cập nhật tag.');
        return null;
    }

    //nếu thành công, lấy tên tag tử server trả về, không có thì dùng tên user nhập
    const tagName = data.tag?.name || newTag.trim();
    //tìm tất cả task có taskid đó
    const records = document.querySelectorAll(`[data-role="task"][data-task-id="${CSS.escape(String(taskId))}"]`);

    //nếu server trả về tag thì thêm tag vào tất cả dropdown
    if (data.tag) addTaskTagToMenus(data.tag);

    //cập nhật chữ tag đang hiển thị trong task và cập nhật data-tag
    records.forEach((record) => {
        //tìm phần hiển thị tag
        const tagText = record.querySelector('[id^="tag-text-"], .task-tag-text');
        if (tagText) tagText.innerText = tagName;
        record.dataset.tag = tagName;
    });

    //nếu có hàm reload ajax thì gọi để tải lại danh sách task mà không bị refresh trang
    if (typeof window.reloadTaskListAjax === 'function') {
        await window.reloadTaskListAjax(false);
    }

    return data;
}

//mở modal tag
function openTagModal({ mode, taskId = '', tagId = '', currentName = '', title, description, submitText, icon, buttonClass }) {
    const modalElement = document.getElementById('tagManageModal');
    if (!modalElement) return;

    //ghi dữ liệu vào các input ẩn
    document.getElementById('tagManageMode').value = mode; //đang thêm/xóa/sửa
    document.getElementById('tagManageTaskId').value = taskId || ''; //task liên quan
    document.getElementById('tagManageTagId').value = tagId || ''; //tag cần sửa/xóa
    document.getElementById('tagManageCurrentName').value = currentName || ''; //tên tag hiện tại

    //đổi tiêu đề modal
    document.getElementById('tagManageModalTitle').innerHTML = `<i class="fa-solid ${icon || 'fa-tag'} text-primary me-2"></i>${title}`;
    //đổi mô tả modal
    document.getElementById('tagManageDescription').textContent = description || '';

    //lấy các phần tử trong modal
    const nameGroup = document.getElementById('tagManageNameGroup'); //nhóm input tên tag
    const nameInput = document.getElementById('tagManageName'); //ô nhập tên task
    const submitButton = document.getElementById('tagManageSubmit'); //nút submit
    const errorBox = document.getElementById('tagManageError'); //box báo lỗi

    //nếu mode là delete thì ẩn ô nhập tên
    nameGroup?.classList.toggle('d-none', mode === 'delete');

    //nếu có input tên, set giá trị hiện tại và bật required nếu không phải delete
    if (nameInput) {
        nameInput.value = currentName || '';
        nameInput.required = mode !== 'delete';
    }

    //đổi class và nội dung nút submit theo mode
    if (submitButton) {
        submitButton.className = `btn ${buttonClass || 'btn-primary'} fw-bold px-4 shadow-sm`;
        submitButton.innerHTML = `<i class="fa-solid ${icon || 'fa-check'} me-2"></i>${submitText}`;
    }

    //ẩn box lỗi
    errorBox?.classList.add('d-none');
    //mở modal bằng bootstrap js
    bootstrap.Modal.getOrCreateInstance(modalElement).show();
}

//mở modal tạo tag
function promptNewTag(taskId) {
    openTagModal({
        mode: 'create',
        taskId,
        title: 'Tạo tag mới',
        description: 'Nhập tên tag mới để gán cho công việc này.',
        submitText: 'Tạo tag',
        icon: 'fa-plus',
        buttonClass: 'btn-primary'
    });
}

//mở modal sửa tag
function renameTag(tagId, currentName) {
    openTagModal({
        mode: 'edit',
        tagId,
        currentName,
        title: 'Sửa tag',
        description: 'Đổi tên tag này cho tất cả công việc đang sử dụng.',
        submitText: 'Lưu thay đổi',
        icon: 'fa-pen',
        buttonClass: 'btn-primary'
    });
}

//gọi API xóa tag
async function deleteTag(tagId, tagName) {
    //try/catch nghĩa là thử chạy, nễu lỗi mạng/js thì không làm crash trang
    try {
        //gửi cho hàm destroy ở tag controller
        const res = await fetch(`/tags/${tagId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken()
            }
        });

        //đọc json response, lỗi thì data = null
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) return;

        //xóa tag khỏi tất cả dropdown
        removeTaskTagFromMenus(tagId);
        //tìm các task đang dùng task đó, chuyển về '---'
        updateRowsUsingTag(tagName, '');
    } catch {
    }
}

