<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryShowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'image' => $this->image,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'children' => self::collection($this->whenLoaded('children')),
            // Use the CategoryProductResource to format the products collection.
            'products' => CategoryProductResource::collection($this->whenLoaded('products')),
        ];
    }
}
