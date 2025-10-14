<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            //
            'checkout_id' => \App\Models\Checkout::factory(),
            'payment_gateway' => $this->faker->randomElement(['stripe', 'paypal']),
            'gateway_transaction_id' => $this->faker->uuid(),
            'amount' => $this->faker->randomFloat(2, 10, 1000),
            'currency' => $this->faker->currencyCode(),
            'status' => $this->faker->randomElement(['pending', 'succeeded', 'failed', 'refunded']),
            'payment_method_details' => $this->faker->optional()->json(),
        ];
    }
};
