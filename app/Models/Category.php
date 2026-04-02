<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Relations\HasOne;

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
        'created_at',
        'updated_at',
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
        )->withTimestamps();
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
        )->withTimestamps();
    }

    public function getBreadcrumb()
    {
        $breadcrumb = [$this->title];
        $parent = $this->parents()->first(); // Get the first parent

        while ($parent) {
            array_unshift($breadcrumb, $parent->title);
            $parent = $parent->parents()->first();
        }

        return implode(' > ', $breadcrumb);
    }

    public function getFullSlug()
    {
        $slugs = [$this->slug];
        $parent = $this->parents()->first();

        while ($parent) {
            array_unshift($slugs, $parent->slug);
            $parent = $parent->parents()->first();
        }

        return implode('/', $slugs);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class)
            ->withPivot('sku', 'product_order')
            ->withTimestamps()
            ->orderBy('product_order');
    }


    function media(): HasOne
    {
        return $this->hasOne(Media::class,  'file_name', 'image');
    }
}
