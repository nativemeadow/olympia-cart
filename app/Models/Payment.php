<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentFactory> */
    use HasFactory;

    protected $fillable = [
        'checkout_id',
        'payment_gateway',
        'gateway_transaction_id',
        'amount',
        'currency',
        'status',
        'payment_method_details',
    ];

    protected $casts = [
        'payment_method_details' => 'array',
    ];

    /**
     * Get the checkout that owns the payment.
     */
    public function checkout()
    {
        return $this->belongsTo(Checkout::class);
    }

    /**
     * Determine if the payment was successful.
     */
    public function isSuccessful(): bool
    {
        return $this->status === 'succeeded';
    }
}
