<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('alt_text')->nullable();
            $table->string('file_path');
            $table->string('file_name')->index();
            $table->string('mime_type');
            $table->unsignedInteger('size');
            $table->string('disk')->default('public');
            $table->string('type')->nullable()->index(); // e.g., 'product', 'category', 'faq'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
