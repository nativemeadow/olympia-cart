<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Cart>
 */
class CartFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        return [
            'customer_id' => \App\Models\Customer::factory(),
            'status' => $this->faker->randomElement(['active', 'inactive', 'pending', 'completed']),
            'total' => $this->faker->randomFloat(2, 0, 1000),
            'token' => $this->faker->uuid(),
            'active' => $this->faker->boolean(),
            'cart_uuid' => $this->faker->uuid(),
        ];
    }
}
