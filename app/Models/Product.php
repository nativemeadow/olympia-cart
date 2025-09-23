<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'sku',
        'title',
        'description',
        'image',
        'category_id',
        'created_at',
        'updated_at',
    ];

    function prices(): HasMany
    {
        return $this->hasMany(Price::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class)
            ->withPivot('sku', 'product_order')
            ->withTimestamps();
    }
}
