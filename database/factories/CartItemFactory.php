<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Cart_Item>
 */
class CartItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cart_id' => \App\Models\Cart::factory(),
            'product_id' => \App\Models\Product::factory(),
            'quantity' => $this->faker->numberBetween(1, 10),
            'price' => $this->faker->randomFloat(2, 1, 100),
            'total' => function (array $attributes) {
                return $attributes['quantity'] * $attributes['price'];
            },
            'cart_item_uuid' => $this->faker->uuid(),
            'category_slug' => $this->faker->slug(),
            'product_slug' => $this->faker->slug(),
            'sku' => $this->faker->unique()->bothify('SKU-#####'),
            'title' => $this->faker->word(),
            'image' => $this->faker->imageUrl(),
            'unit' => $this->faker->randomElement(['piece', 'kg', 'litre']),
            'color' => $this->faker->safeColorName(),
            'cart_uuid' => $this->faker->uuid(),
        ];
    }
}
