<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
// Bảng Habits lưu trữ thông tin về thói quen của người dùng,
// bao gồm tiêu đề, chuỗi hiện tại, chuỗi tối đa và tổng số lần hoàn thành.
// Bảng này có quan hệ một-nhiều với bảng HabitLogs,
// nơi lưu trữ các bản ghi về việc hoàn thành thói quen hàng ngày.
return new class extends Migration {
    public function up(): void
    {
        Schema::create('habits', function (Blueprint $table) {
            $table->id();
            // khi người dùng bị xóa bảng habit bị xóa theo
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->integer('current_streak')->default(0);
            $table->integer('max_streak')->default(0);
            $table->integer('total_completed')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('habits');
    }
};
