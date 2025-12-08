<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('checkouts', function (Blueprint $table) {
            $table->id(); // This is already an unsigned big integer
            $table->foreignId('cart_id')->constrained('carts')->onDelete('cascade');
            $table->string('status')->default('pending');
            // pickup or delivery
            $table->boolean('is_pickup')->default(true);
            $table->boolean('is_delivery')->default(false);
            $table->date('pickup_date')->nullable();
            $table->string('pickup_time')->nullable();
            $table->date('delivery_date')->nullable();
            $table->string('delivery_time')->nullable();
            $table->foreignId('delivery_address_id')->nullable()->constrained('addresses')->onDelete('set null');
            $table->foreignId('billing_address_id')->nullable()->constrained('addresses')->onDelete('set null');
            $table->string('instructions')->nullable();
            $table->timestamps();
        });

        // Add check constraints for data integrity using raw statements for compatibility

        // SQLite does not support adding constraints to existing tables.
        if (DB::getDriverName() !== 'sqlite') {
            // 1. A checkout can be for pickup or delivery, but not both.
            DB::statement('ALTER TABLE checkouts ADD CONSTRAINT chk_checkout_pickup_or_delivery CHECK (is_pickup + is_delivery <= 1)');

            // 2. If it's a pickup, date/time must be set. If not, they must be NULL.
            DB::statement('ALTER TABLE checkouts ADD CONSTRAINT chk_checkout_pickup_fields CHECK ((is_pickup = false AND pickup_date IS NULL AND pickup_time IS NULL) OR (is_pickup = true AND pickup_date IS NOT NULL AND pickup_time IS NOT NULL))');

            // 3. If it's a delivery, date/time and address must be set. If not, they must be NULL.
            DB::statement('ALTER TABLE checkouts ADD CONSTRAINT chk_checkout_delivery_fields CHECK ((is_delivery = false AND delivery_date IS NULL AND delivery_time IS NULL AND delivery_address_id IS NULL) OR (is_delivery = true AND delivery_date IS NOT NULL AND delivery_address_id IS NOT NULL))');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checkouts');
    }
};
