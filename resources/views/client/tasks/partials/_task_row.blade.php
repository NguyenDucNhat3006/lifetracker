@php
    $firstTag = $task->tag;
    $tagName = $firstTag ? $firstTag->name : '';  //không có tag thì để rỗng
    $displayTagName = $tagName !== '' ? $tagName : '---'; //không có tag thì hiển thị "---"

    //chuyển giá trị trong database ra tiếng việt để hiển thị
    $priorityColors = [
        'high' => ['label' => 'Cao'],
        'med' => ['label' => 'Trung bình'],
        'low' => ['label' => 'Thấp'],
    ];
    $pColor = $priorityColors[$task->priority] ?? $priorityColors['med']; //giá trị không hợp lệ thì mặc định về med
    $showDeadline = $showDeadline ?? true;
@endphp

<tr class="border-bottom task-row-item"
    id="task-row-{{ $task->id }}"
    {{-- data-* là hmtl custom data attribute, không hiện ra giao diện, để js đọc --}}
    data-role="task" {{-- đánh dấu item task --}}
    data-task-id="{{ $task->id }}" {{-- lưu id --}}
    data-update-status-url="{{ route('tasks.update-status', $task->id) }}" {{-- lưu url để cập nhật status checkbox --}}
    data-update-url="{{ route('tasks.update', $task->id) }}" {{-- lưu url để sửa task --}}
    data-delete-url="{{ route('tasks.destroy', $task->id) }}" {{-- lưu url để xóa task --}}
    data-tag="{{ $tagName }}" {{-- lưu tag hiện tại --}}
    data-priority="{{ $task->priority }}" {{-- lưu priority hiện tại --}}
    data-search-title="{{ \Illuminate\Support\Str::lower($task->title) }}" {{-- lưu title dạng chữ thường để search --}}
    data-title="{{ e($task->title) }}" {{-- lưu title gốc, e() là helper laravel chỗng lỗi chèn html/script không mong muốn --}}
    data-due-date="{{ $task->due_date ? \Carbon\Carbon::parse($task->due_date)->toDateString() : '' }}"> {{-- lưu ngày dạng chuẩn YYYY-MM-DD --}}

    {{-- check box hoàn thành --}}
    <td class="task-cell-check">
        <input class="form-check-input shadow-none fs-5 border-secondary-subtle task-status-checkbox" type="checkbox"
            data-task-id="{{ $task->id }}" {{ $task->status === 'done' ? 'checked' : '' }}>
    </td>

    {{-- title --}}
    <td class="fw-medium text-dark task-cell-title">
        {{-- text-truncate: cắt chữ dài thành... --}}
        <span class="task-title-text d-block text-truncate" id="task-title-text-{{ $task->id }}">{{ $task->title }}</span>
    </td>

    @include('client.tasks.partials._task_row_tag', ['task' => $task, 'tags' => $tags, 'displayTagName' => $displayTagName])

    {{-- cột deadline --}}
    @if($showDeadline)
        <td class="task-cell-deadline">
            <input type="date"
                class="form-control form-control-sm bg-light border text-muted rounded-pill px-3 py-2 shadow-none task-deadline-input"
                data-task-id="{{ $task->id }}" {{-- cho biết thuộc task nào --}}
                value="{{ $task->due_date ? \Carbon\Carbon::parse($task->due_date)->format('Y-m-d') : '' }}">
        </td>
    @endif

    @include('client.tasks.partials._task_row_priority', ['task' => $task, 'pColor' => $pColor])

    @include('client.tasks.partials._task_row_actions', ['task' => $task])
</tr>
