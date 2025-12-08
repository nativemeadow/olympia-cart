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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checkout_id')->constrained('checkouts')->onDelete('cascade');
            $table->string('payment_gateway'); // e.g., 'stripe', 'paypal'
            $table->string('gateway_transaction_id')->unique(); // ID from the payment provider
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3);
            $table->string('status'); // e.g., 'pending', 'succeeded', 'failed', 'refunded'
            $table->json('payment_method_details')->nullable(); // Store card type, last 4 digits, etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
