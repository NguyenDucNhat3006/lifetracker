//đợi html load xong rồi mới chạy
document.addEventListener('DOMContentLoaded', () => {
    //lấy element trên trang
    const dailyDateInput = document.getElementById('dailyDate'); //input chọn ngày của daily task
    const searchInput = document.getElementById('taskSearch'); //ô search
    const tagFilter = document.getElementById('tagFilter'); //lọc tag
    const priorityFilter = document.getElementById('priorityFilter'); //lọc ưu tiên
    const filterForm = document.getElementById('taskFilterForm'); //form chứa các filter, hàm build url sẽ lấy dữ liệu từ form này
    let filterSubmitTimer = null; //debounce khi search
    let taskFetchController = null; //hủy request cũ khi có request mới

    //tạo url lọc task. pageUrl mặc định là null, chỉ có giá trị khi user bấm link phân trang
    function buildTaskFilterUrl(pageUrl = null) {
        //không thấy form filter thì trả lại url hiện tại của trình duyệt
        if (!filterForm) return new URL(window.location.href);

        //tạo url object từ action của form
        const url = new URL(filterForm.action, window.location.origin);
        //lấy toàn bộ dữ liệu trong form
        const formData = new FormData(filterForm);

        formData.forEach((value, key) => {
            value = String(value || '').trim();
            //nếu value không trống thì đưa và query string
            if (value !== '') url.searchParams.set(key, value);
        });

        //để chuyển trang mà vẫn giữ nguyên search, lọc
        //nếu người dùng bấm phân trang
        if (pageUrl) {
            //tạo url object từ link phân trang rồi lấy query page
            const page = new URL(pageUrl, window.location.origin).searchParams.get('page');
            //nếu lấy được page thì gắn page vào url filter hiện tại
            if (page) url.searchParams.set('page', page);
        }

        return url;
    }

    //load danh sách task bằng ajax
    //pushState: có cập nhật url trình duyệt hay không
    async function loadTaskList(url, pushState = true) {
        if (!filterForm) return;

        //nếu có request cũ thì hủy request đó
        if (taskFetchController) taskFetchController.abort();
        //tạo controller mới cho request hiện tại
        taskFetchController = new AbortController();

        //lấy danh sách task và phân trang hiện tại
        const taskListArea = document.getElementById('taskListArea');
        const paginationArea = document.getElementById('taskPaginationArea');

        try {
            //nếu có vùng task, làm mở xuống cho hiệu ứng loading
            if (taskListArea) taskListArea.style.opacity = '0.45';

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    //request là ajax
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'text/html'
                },
                //để khi gọi abort, request hiện tại sẽ bị hủy
                signal: taskFetchController.signal
            });

            const html = await response.text();
            //parse chuỗi html thành document
            const doc = new DOMParser().parseFromString(html, 'text/html');
            //lấy vùng task và phân trang mới từ html vừa tải
            const newTaskListArea = doc.getElementById('taskListArea');
            const newPaginationArea = doc.getElementById('taskPaginationArea');

            //thay nội dung của vùng task và phân trang
            if (newTaskListArea && taskListArea) taskListArea.innerHTML = newTaskListArea.innerHTML;
            if (newPaginationArea && paginationArea) paginationArea.innerHTML = newPaginationArea.innerHTML;
            //cập nhật url mà không reload trang
            if (pushState) window.history.pushState({}, '', url.toString());

            //chuẩn hóa lại dropdown tag
            normalizeTaskTagMenus();
        } catch (error) {
            //nếu lỗi là abort thì bỏ qua, lỗi khác thì in ra console
            if (error.name !== 'AbortError') console.error(error);
        } finally {
            //khôi phục opacity
            if (taskListArea) taskListArea.style.opacity = '1';
        }
    }

    //submit filter bằng ajax
    function submitTaskFilterAjax(delay = 350) {
        if (!filterForm) return;
        //xóa timeout cũ, để user gõ liên tục
        clearTimeout(filterSubmitTimer);
        //sau khi delay, build url filter rồi load task list
        filterSubmitTimer = setTimeout(() => loadTaskList(buildTaskFilterUrl()), delay);
    }

    //tạo hàm global để các file khác có thể gọi.
    //pushState = false là reload danh sách nhưng không đổi lịch sử url
    window.reloadTaskListAjax = function (pushState = false) {
        //build url filter hiện tại, rồi load lại danh sách
        return loadTaskList(buildTaskFilterUrl(), pushState);
    };

    //đổi ngảy trong daily
    //nếu có input chọn ngày thì gắn sự kiện
    dailyDateInput?.addEventListener('change', (event) => {
        //chuyển trang sang url daily của ngày user chọn
        if (event.target.value) window.location.href = buildDailyUrl(event.target.value);
    });

    //search delay 350. tag, priority delay 0
    searchInput?.addEventListener('input', () => submitTaskFilterAjax(350));
    tagFilter?.addEventListener('change', () => submitTaskFilterAjax(0));
    priorityFilter?.addEventListener('change', () => submitTaskFilterAjax(0));

    //click phân trang bằng ajax
    document.addEventListener('click', function (event) {
        //từ phần tử được click, tìm cha gần nhất là link phân trang
        const pageLink = event.target.closest('#taskPaginationArea .pagination a');
        if (!pageLink) return;

        event.preventDefault();
        //build url filter hiện tại, lấy thêm page từ link vừa bấm rồi load lại bằng ajax
        loadTaskList(buildTaskFilterUrl(pageLink.href));
    });

    //bắt sự kiện back/forward của trình duyệt, khi user bấm back, url thay đổi, load lại task list theo url mới
    //false nghĩ là không push thêm lịch sử mới nữa, vì user đang lùi/tiến trong lịch sử rồi
    window.addEventListener('popstate', () => loadTaskList(new URL(window.location.href), false));

    //chuẩn hóa dropdown tag
    normalizeTaskTagMenus();
});
