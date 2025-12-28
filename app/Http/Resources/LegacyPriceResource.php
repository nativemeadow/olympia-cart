<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str; // Import the Str helper

class LegacyPriceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // 1. Define the base properties that are always present on the variant itself.
        $baseData = [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'sku' => $this->sku,
            'price' => $this->price,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        // 2. Dynamically create a key-value array from the variant's attributes.
        // This is only executed if the 'attributeValues' relationship has been eager-loaded.
        $dynamicAttributes = $this->whenLoaded('attributeValues', function () {
            return $this->attributeValues->mapWithKeys(function ($attributeValue) {
                // Convert the attribute name to snake_case to create a valid JSON key.
                // e.g., "Online Minimum" becomes "online_minimum"
                $key = Str::snake($attributeValue->attribute->name);
                return [$key => $attributeValue->value];
            })->all();
        }, []); // Default to an empty array if not loaded.

        // 3. Merge the base properties and the dynamic attributes into a single flat array.
        return array_merge($baseData, $dynamicAttributes);
    }
}
