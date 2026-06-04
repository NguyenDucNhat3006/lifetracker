//hàm tự chạy không cần gọi
//xử lý per page theo kích thước màn hình
(function () {
    //kiểm tra có phải mobile không
    const isTaskMobile = window.matchMedia('(max-width: 575.98px)').matches;
    //tạo object url từ url hiện tại của trình duyệt
    const url = new URL(window.location.href);
    //lấy query per_page từ url
    const currentPerPage = url.searchParams.get('per_page');

    //nếu là mobile và url chưa có per_page=4
    if (isTaskMobile && currentPerPage !== '4') {
        //set query string per_page=4
        url.searchParams.set('per_page', '4');
        //chuyển trình duyệt sang url mới
        //dùng replace() để tránh lưu url trung gian vào hisory
        //user bấm back sẽ không bị quay lại url thiểu per_page rồi redirect tiếp
        window.location.replace(url.toString());
        return;
    }

    //desktop thì bỏ per_page=4
    if (!isTaskMobile && currentPerPage === '4') {
        url.searchParams.delete('per_page');
        window.location.replace(url.toString());
        return;
    }

    //nếu không redirect ở 2 khối trên thì đợi html load xong rồi chạy
    document.addEventListener('DOMContentLoaded', function () {
        const perPageInput = document.getElementById('taskPerPageInput');
        if (perPageInput) perPageInput.value = isTaskMobile ? '4' : '8';
    });
})();

//tạo object chứa dữ liệu trang task
const taskPageData = (() => {
    const dataElement = document.getElementById('taskPageData');
    if (!dataElement) return {};

    try {
        return JSON.parse(dataElement.textContent || '{}');
    } catch {
        return {};
    }
})();

//lấy chế độ xem hiện tại
function getCurrentTaskView() {
    return taskPageData.view || 'daily';
}

//lấy ngày đang chọn
function getCurrentDailyDate() {
    return taskPageData.selectedDate || '';
}

//tạo url cho daily task theo ngày
function buildDailyUrl(dateStr) {
    //lấy url gốc của trang task
    const base = taskPageData.indexUrl || window.location.pathname;
    //tạo object để build query string
    const params = new URLSearchParams();
    //thêm query view và ngày
    params.set('view', 'daily');
    params.set('date', dateStr);

    //lấy giá trị hiện tại của ô search, tag, priority
    const search = document.getElementById('taskSearch')?.value.trim() || '';
    const tag = document.getElementById('tagFilter')?.value || '';
    const priority = document.getElementById('priorityFilter')?.value || '';

    //không rỗng thì thêm vào url
    if (search !== '') params.set('search', search);
    if (tag !== '') params.set('tag', tag);
    if (priority !== '') params.set('priority', priority);

    //trả về url hoàn chỉnh
    return `${base}?${params.toString()}`;
}

//format object date thành chuỗi
function formatLocalDate(date) {
    const year = date.getFullYear();
    //trong js tháng từ 0-11 nên phải + 1
    //padStart(2, '0'): đảm bảo luôn có 2 chữ số
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

//lùi/sang ngày daily task
//deltaDays là ngày muốn cộng thêm
function shiftDailyDate(deltaDays) {
    //tìm input chọn ngày
    const input = document.getElementById('dailyDate');
    if (!input || !input.value) return;

    //tạo object từ ngày trong input
    const date = new Date(input.value + 'T00:00:00');

    //nếu date không hợp lệ thì return
    if (Number.isNaN(date.getTime())) return;

    //lấy ngày hiện tại + deltaDays rồi set lại
    date.setDate(date.getDate() + deltaDays);
    //đổi date object thành chuỗi YYYY-MM-DD, tạo url daily cho ngày đó, chuyển trình duyệt sang url mới
    window.location.href = buildDailyUrl(formatLocalDate(date));
}

//quay về ngày hiện tại
function goToday() {
    //tạo date object thời điểm hiện tại
    //lấy ngày dạng YYYY-MM-DD
    //tạo url daily
    //gán cho window.locatin.href để chuyển trang
    window.location.href = buildDailyUrl(formatLocalDate(new Date()));
}

//hàm escape html
//sử dụng khi đưa dữ liệu động vào html string
function escapeTaskHtml(value) {
    //value là null hoặc undefined thì thành rỗng
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
