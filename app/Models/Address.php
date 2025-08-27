<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    /** @use HasFactory<\Database\Factories\AddressFactory> */
    use HasFactory;
    protected $fillable = [
        'user_id',
        'address1',
        'address2',
        'city',
        'state',
        'zip',
        'country',
        'phone',
        'default',
        'billing'
    ];

    function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
