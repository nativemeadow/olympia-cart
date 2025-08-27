<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    /** @use HasFactory<\Database\Factories\CategoryFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'url',
        'image',
        'is_active',
    ];
    /**
     * The parent categories of this category.
     */
    public function parents()
    {
        return $this->belongsToMany(
            Category::class,
            'category_category',
            'child_id',
            'parent_id'
        );
    }

    /**
     * The child categories of this category.
     */
    public function children()
    {
        return $this->belongsToMany(
            Category::class,
            'category_category',
            'parent_id',
            'child_id'
        );
    }

    public function products()
    {
        return $this->belongsToMany(Product::class)
            ->withPivot('sku', 'product_order')
            ->withTimestamps();
    }
}
