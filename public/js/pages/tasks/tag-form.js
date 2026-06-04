//bắt sự kiện submit form, khi form được submit thì chạy hàm bên trong
document.getElementById('tagManageForm')?.addEventListener('submit', async function (event) {
    //chặn submit mặc định, tự xử lý bằng ajax/fetch rồi cập nhật giao diện
    event.preventDefault();

    //lấy dữ liệu từ modal
    const mode = document.getElementById('tagManageMode')?.value || 'create';
    const taskId = document.getElementById('tagManageTaskId')?.value || '';
    const tagId = document.getElementById('tagManageTagId')?.value || '';
    const currentName = document.getElementById('tagManageCurrentName')?.value || '';
    const nextName = (document.getElementById('tagManageName')?.value || '').trim();
    const errorBox = document.getElementById('tagManageError');

    //ẩn box lỗi trước mỗi lần submit
    errorBox?.classList.add('d-none');

    //nếu không phải mode delete mà tên mới rỗng thì báo lỗi
    if (mode !== 'delete' && nextName === '') {
        errorBox?.classList.remove('d-none');
        return;
    }

    try {
        //nếu là create
        if (mode === 'create') {
            //gọi hàm updateTag trong tags.js
            const data = await updateTag(taskId, nextName);
            //không thành công thì dừng
            if (!data?.success) return;

            //thành công thì đóng modal
            bootstrap.Modal.getOrCreateInstance(document.getElementById('tagManageModal')).hide();
            //return để không chạy phần sửa/xóa bên dưới
            return;
        }

        //nếu không phải create, gọi api sửa hoặc xóa tag
        const res = await fetch(`/tags/${tagId}`, {
            method: mode === 'delete' ? 'DELETE' : 'PATCH', //nếu là delete thì dùng DELETE, edit thì dùng PATCH
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken()
            },
            //nếu là delete thì body là null, edite thì gủi tên mới
            body: mode === 'delete' ? null : JSON.stringify({ name: nextName })
        });

        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) {
            errorBox?.classList.remove('d-none');
            return;
        }

        bootstrap.Modal.getOrCreateInstance(document.getElementById('tagManageModal')).hide();

        //nếu là xóa
        if (mode === 'delete') {
            //xóa tag khỏi tất cả dropdown
            removeTaskTagFromMenus(tagId);
            //tìm task đang dùng task bị xóa rồi đổi tag thành rỗng
            updateRowsUsingTag(currentName, '');
            return;
        }

        //lấy tên tag mới, ưu tiên dùng tên server trả về, không có thì dùng tên user nhập
        const nextTagName = data.tag?.name || nextName;
        //nếu tag vừa sửa bị gộp vào 1 tag đã tồn tại
        if (data.merged) {
            //xóa tag cũ khỏi tất cả dropdown
            removeTaskTagFromMenus(tagId);
            //đảm bảo tag đã được gộp tồn tại trong tất cả dropdown
            addTaskTagToMenus(data.tag);
        } else { //không gộp thì đổi tên tag trong tất cả dropdown
            renameTaskTagInMenus(tagId, nextTagName);
        }
        //cập nhật những task đang hiện tag cũ
        updateRowsUsingTag(data.old_name || currentName, nextTagName);
    } catch {
        errorBox?.classList.remove('d-none');
    }
});

