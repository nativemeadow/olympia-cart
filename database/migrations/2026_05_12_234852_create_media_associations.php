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
        Schema::create('media_associations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_id')->constrained()->onDelete('cascade');
            $table->morphs('mediable'); // This creates mediable_id and mediable_type
            $table->integer('order')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */

    public function down(): void
    {
        Schema::dropIfExists('media_associations');
    }
};
