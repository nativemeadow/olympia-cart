<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Price extends Model
{
    /** @use HasFactory<\Database\Factories\PriceFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'title',
        'description',
        'image',
        'price',
        'currency',
        'unit',
        'size',
        'coverage',
        'coverage_value',
        'online-minimum',
    ];

    function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
