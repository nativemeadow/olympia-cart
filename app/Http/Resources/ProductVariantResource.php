<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'price' => $this->price, // Assuming price is stored in cents
            'attributes' => $this->whenLoaded('attributeValues', function () {
                // This maps the collection into a clean key-value object.
                // e.g., "Size" => "5kg", "Unit" => "Bag"
                return $this->attributeValues->mapWithKeys(function ($attributeValue) {
                    return [$attributeValue->attribute->name => $attributeValue->value];
                });
            }),
        ];
    }
}
