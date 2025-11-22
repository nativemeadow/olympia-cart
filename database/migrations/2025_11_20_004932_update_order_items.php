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
        Schema::table('order_items', function (Blueprint $table) {
            //
            $table->string('slug')->after('product_id')->nullable();
            $table->string('title')->after('slug')->nullable();
            $table->string('sku')->after('title')->nullable();
            $table->string('unit')->after('sku')->nullable();
            $table->string('image')->after('unit')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            //
            $table->dropColumn(['slug', 'sku', 'unit']);
        });
    }
};
