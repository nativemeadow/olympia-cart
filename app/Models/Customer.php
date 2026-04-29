<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    /** @use HasFactory<\Database\Factories\CustomerFactory> */
    use HasFactory;

    // allow soft deletes for customers, so we can keep track of deleted
    // customers and potentially restore them later
    use SoftDeletes;

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
