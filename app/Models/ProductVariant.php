<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Model;
use App\Models\Product;
use App\Models\Attribute;
use App\Models\AttributeValue;


class ProductVariant extends Model
{
    /** @use HasFactory<\Database\Factories\ProductVariantFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'price',
        'stripe_price_id',
    ];

    /**
     * Get the parent product that this variant belongs to.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * The attribute values that belong to the product variant.
     * This defines the many-to-many relationship.
     */
    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(
            AttributeValue::class,
            'attribute_value_product_variant', // The name of the pivot table
            'product_variant_id',              // The foreign key on the pivot table for this model
            'attribute_value_id'               // The foreign key on the pivot table for the related model
        );
    }
}
