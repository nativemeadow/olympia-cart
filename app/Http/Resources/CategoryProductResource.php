<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'image' => $this->image,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Here we map the 'variants' relationship to a key named 'prices'
            // and use our LegacyPriceResource to format each item.
            'prices' => LegacyPriceResource::collection($this->whenLoaded('variants')),
        ];
    }
}
