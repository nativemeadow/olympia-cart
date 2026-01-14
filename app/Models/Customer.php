<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    /** @use HasFactory<\Database\Factories\CustomerFactory> */
    use HasFactory;
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'company',
        'active',
    ];

    function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    function carts(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }
}
