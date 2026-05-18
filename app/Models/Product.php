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

    public function categories()
    {
        return $this->belongsToMany(Category::class)
            ->withPivot(['sku', 'product_order'])
            ->withTimestamps();
    }

    public function firstCategory(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Category::class, 'id', 'category_id');
    }

    function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function lowestPriceVariant(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProductVariant::class)->ofMany('price', 'min');
    }

    public function media()
    {
        return $this->morphToMany(Media::class, 'mediable', 'media_associations');
    }


    // function media(): HasMany
    // {
    //     return $this->hasMany(Media::class,  'file_name', 'image');
    // }

}
