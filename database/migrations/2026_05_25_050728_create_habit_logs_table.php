<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
// Lưu trữ các bản ghi về việc hoàn thành thói quen hàng ngày.
//  Mỗi bản ghi liên kết với một thói quen cụ thể và lưu ngày mà thói quen đó đã được hoàn thành.
// Bảng này có quan hệ nhiều-một với bảng Habits, nơi lưu trữ thông tin về các thói quen của người dùng.
return new class extends Migration {
    public function up(): void
    {
        Schema::create('habit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('habit_id')->constrained('habits')->cascadeOnDelete();
            $table->date('log_date');
            $table->timestamps();
            // 1 thói quen chỉ có 1 log/ngày
            $table->unique(['habit_id', 'log_date']);
            $table->index('log_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('habit_logs');
    }
};
