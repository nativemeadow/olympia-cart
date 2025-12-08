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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->string('title')->after('slug')->nullable();
            $table->string('sku')->after('title')->nullable();
            $table->string('unit')->after('sku')->nullable();
            $table->string('image')->after('unit')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('quantity');
            $table->string('product_slug')->after('title')->nullable();
            $table->string('category_slug')->after('product_slug')->nullable();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
