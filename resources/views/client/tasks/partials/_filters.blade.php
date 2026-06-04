<form id="taskFilterForm" method="GET" action="{{ route('tasks.index') }}" {{-- get là dữ liệu lọc nằm trên url --}}
    class="row g-3 align-items-center mb-4 pb-3 border-bottom">

    <input type="hidden" name="view" value="{{ $view }}"> {{-- giữ view như hiện tại, ẩn trên giao diện user --}}
    <input id="taskPerPageInput" type="hidden" name="per_page" value="{{ request('per_page', 8) }}"> {{-- giữ số task 1 trang như url, mặc định là 8 --}}

    @if($isDaily) {{-- giữ ngày đang xem daily task --}}
        <input type="hidden" name="date" value="{{ $selectedDate }}">
    @endif

    {{-- search --}}
    <div class="col-12 col-lg"> {{-- mobile chiếm full column, còn lại linh hoạt --}}
        <div class="input-group"> {{-- input-group dùng để gộp icon kính lúp và ô input thành 1 cụm --}}
            <span class="input-group-text bg-light border-0"> {{-- input-group-text tạo text/icon đi kèm trong input-group --}}
                <i class="fa-solid fa-magnifying-glass text-muted"></i> {{-- icon kính lúp --}}
            </span>

            <input id="taskSearch" name="search" type="text" class="form-control bg-light border-0 shadow-none"
                placeholder="Tìm kiếm..." value="{{ $search }}"> {{-- value="{{ $search }} là để giữ lại text sau khi lọc --}}
        </div>
    </div>

    {{-- tag --}}
    <div class="col-12 col-md-6 col-lg-3"> {{-- moblie full, medium 1/2, large 1/4 --}}
        <select id="tagFilter" name="tag"
            class="form-select border-0 bg-light shadow-none fw-medium text-muted w-100"> {{-- w-100 là select chiểm 100% chiều rộng --}}
            <option value="">Tất cả danh mục</option>

            @foreach($tags as $t)
                <option value="{{ $t->name }}" {{ $tagFilter === $t->name ? 'selected' : '' }}> {{-- khi f5 sẽ giữ tag đã chọn --}}
                    {{ $t->name }}
                </option>
            @endforeach
        </select>
    </div>

    {{-- priority --}}
    <div class="col-12 col-md-6 col-lg-3"> {{-- giống tag --}}
        <select id="priorityFilter" name="priority"
            class="form-select border-0 bg-light shadow-none fw-medium text-muted w-100">
            <option value="">Tất cả mức độ</option>
            {{-- chỉ có 3 giá trị mặc định nên ko foreach --}}
            <option value="high" {{ $priorityFilter === 'high' ? 'selected' : '' }}>Cao</option>
            <option value="med" {{ $priorityFilter === 'med' ? 'selected' : '' }}>Trung bình</option>
            <option value="low" {{ $priorityFilter === 'low' ? 'selected' : '' }}>Thấp</option>
        </select>
    </div>
</form>
