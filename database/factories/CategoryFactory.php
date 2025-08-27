<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->word(),
            'uuid' => $this->faker->uuid(),
            'slug' => $this->faker->slug(),
            'description' => $this->faker->sentence(),
            'url' => $this->faker->url(),
            'image' => $this->faker->imageUrl(),
            'is_active' => $this->faker->boolean(),

        ];
    }
}
