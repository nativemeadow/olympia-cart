<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Price>
 */
class PriceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sku' => strtoupper($this->faker->bothify('???-#####')),
            'title' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'image' => $this->faker->imageUrl(640, 480, 'products', true),
            'amount' => $this->faker->randomFloat(2, 1, 1000),
            'currency' => $this->faker->randomElement(['USD', 'EUR', 'GBP']),
            'unit' => $this->faker->randomElement(['each', 'lbs', 'ton']),
            'size' => $this->faker->randomElement(['small', 'medium', 'large']),
            'coverage' => $this->faker->randomElement(['1 sqft', '5 sqft', '10 sqft']),
            'coverage_unit' => $this->faker->numberBetween(1, 100),
            'online_minimum' => $this->faker->numberBetween(1, 100),
            'product_id' => \App\Models\Product::factory(),
        ];
    }
}
