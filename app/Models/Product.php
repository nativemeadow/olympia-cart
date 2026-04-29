<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;
    // allow soft deletes for products, so we can keep track of deleted 
    // products and potentially restore them later
    use SoftDeletes;

    protected $fillable = [
        'id',
        'uuid',
        'slug',
        'sku',
        'title',
        'description',
        'image',
        'status',
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

    function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    function media(): HasMany
    {
        return $this->hasMany(Media::class,  'file_name', 'image');
    }
}
