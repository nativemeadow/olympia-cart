<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Media>
 */
class MediaFactory extends Factory
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
            'description' => $this->faker->sentence(),
            'alt_text' => $this->faker->sentence(),
            'file_path' => $this->faker->filePath(),
            'file_name' => $this->faker->word() . '.' . $this->faker->fileExtension(),
            'mime_type' => $this->faker->mimeType(),
            'size' => $this->faker->numberBetween(1000, 1000000),
            'disk' => 'public',
            'type' => $this->faker->randomElement(['product', 'product-category', 'faq']),

        ];
    }
}
