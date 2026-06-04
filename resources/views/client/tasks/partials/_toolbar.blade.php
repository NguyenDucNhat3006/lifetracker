<div class="row g-3 align-items-center mb-4">
    <div class="col-12 col-md-auto"> {{-- mobile full, tablet trở lên vừa đủ chữ --}}
        <h6 class="fw-bold mb-0 text-dark">
            {{ $isDaily ? 'Công việc trong ngày' : 'Công việc nhiều ngày' }}
        </h6>
    </div>

    <div class="col-12 col-md-auto">
        <div class="btn-group border rounded-pill p-1 w-100"> {{-- rounded-pill là bo tròn dạng viên thuốc, w-100 giúp full width trên mobile --}}
            <a href="{{ route('tasks.index', ['view' => 'daily', 'date' => $selectedDate, 'per_page' => request('per_page', 8)]) }}"
                class="btn btn-sm {{ $isDaily ? 'btn-primary shadow-sm' : 'btn-transparent text-muted' }} rounded-pill px-3 fw-medium">
                Trong ngày
            </a>

            <a href="{{ route('tasks.index', ['view' => 'multi', 'per_page' => request('per_page', 8)]) }}"
                class="btn btn-sm {{ !$isDaily ? 'btn-primary shadow-sm' : 'btn-transparent text-muted' }} rounded-pill px-3 fw-medium">
                Nhiều ngày
            </a>
        </div>
    </div>

    {{-- nếu ở daily thì hiện bộ chọn ngày --}}
    @if($isDaily)
        <div class="col-12 col-lg">
            <div class="row g-2 align-items-center justify-content-lg-end task-date-controls">
                <div class="col-auto">
                    <button type="button" class="btn btn-light btn-sm border" data-action="shift-daily" data-delta="-1" title="Hôm qua">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                </div>

                {{-- bộ chọn ngày --}}
                <div class="col">
                    <input id="dailyDate" type="date" class="form-control form-control-sm w-100" value="{{ $selectedDate }}">
                </div>

                <div class="col-auto">
                    <button type="button" class="btn btn-light btn-sm border" data-action="shift-daily" data-delta="1" title="Ngày mai">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>

                <div class="col-12 col-sm-auto">
                    <button type="button" class="btn btn-light btn-sm border w-100" data-action="go-today">Hôm nay</button>
                </div>
            </div>
        </div>
    @else
        <div class="col d-none d-md-block"></div> {{-- d-md-block là để tablet trở lên giữ khoảng cách trống để nút thêm công việc nằm bên phải --}}
    @endif

    <div class="col-12 col-md-auto">
        <button type="button"
            class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm fw-semibold w-100"
            data-bs-toggle="modal" {{-- dùng để mở modal --}}
            data-bs-target="#addTaskModal"> {{-- chỉ định modal cần mở --}}
            <i class="fa-solid fa-plus me-1"></i>
            Thêm công việc
        </button>
    </div>
</div>
