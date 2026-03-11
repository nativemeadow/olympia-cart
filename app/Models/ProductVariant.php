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

    protected $appends = ['extended_properties', 'price_image', 'title', 'description'];

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

    /**
     * Accessor for extended properties.
     *
     * @return array
     */
    public function getExtendedPropertiesAttribute()
    {
        return $this->attributeValues->mapWithKeys(function ($attributeValue) {
            return [$attributeValue->attribute->name => $attributeValue->value];
        });
    }

    public function getPriceImageAttribute(): ?Media
    {
        $this->loadMissing('attributeValues.attribute');

        $imageValue = $this->attributeValues
            ->first(function ($attributeValue) {
                return strcasecmp($attributeValue->attribute?->name ?? '', 'image') === 0;
            })
            ?->value;

        if (!$imageValue) {
            return null;
        }

        // Handles values like "blue-tile.jpg" or "/uploads/blue-tile.jpg"
        $fileName = basename($imageValue);

        return Media::query()
            ->where('file_name', $fileName)
            ->first();
    }

    public function getTitleAttribute(): string
    {
        $this->loadMissing('attributeValues.attribute');

        $titleParts = $this->attributeValues
            ->filter(function ($attributeValue) {
                return strcasecmp($attributeValue->attribute?->name ?? '', 'title') === 0;
            })
            ->pluck('value')
            ->toArray();

        return implode(' - ', $titleParts);
    }

    public function getDescriptionAttribute(): string
    {
        $this->loadMissing('attributeValues.attribute');

        $descriptionParts = $this->attributeValues
            ->filter(function ($attributeValue) {
                return strcasecmp($attributeValue->attribute?->name ?? '', 'description') === 0;
            })
            ->pluck('value')
            ->toArray();

        return implode(' - ', $descriptionParts);
    }
}
