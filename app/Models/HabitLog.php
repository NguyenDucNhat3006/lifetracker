<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
// Model đại diện cho bảng habit_logs-lưu trữ thông tin về thói quen
class HabitLog extends Model
{
    protected $fillable = [
        'habit_id',
        'log_date',
    ];
    // Định nghĩa log_date để controller nhận đúng định dạng ngày tháng
    protected function casts(): array
    {
        return [
            'log_date' => 'date',
        ];
    }
}
