<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\search_index>
 */
class SearchIndexFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'source_table' => $this->faker->randomElement(['categories', 'products', 'prices']),
            'source_id' => $this->faker->numberBetween(1, 1000),
            'rank' => $this->faker->randomFloat(2, 0, 1), // Example rank value
        ];
    }
}
