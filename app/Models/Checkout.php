<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Checkout extends Model
{
    /** @use HasFactory<\Database\Factories\CheckoutFactory> */
    use HasFactory;
    protected $fillable = [
        'cart_id',
        'status',
        'is_pickup',
        'is_delivery',
        'pickup_date',
        'pickup_time',
        'delivery_date',
        'delivery_time',
        'delivery_address_id',
        'billing_address_id',
        'instructions',
    ];

    /**
     * Get the delivery address for the checkout.
     */
    public function deliveryAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'delivery_address_id');
    }

    /**
     * Get the billing address for the checkout.
     */
    public function billingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'billing_address_id');
    }

    /**
     * Get the cart associated with the checkout.
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }
}
