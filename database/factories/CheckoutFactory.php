<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\Checkout;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Checkout>
 */
class CheckoutFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $is_pickup = $this->faker->boolean(70); // 70% chance of being a pickup

        return [
            'cart_id' => \App\Models\Cart::factory(),
            'status' => $this->faker->randomElement(['pending', 'completed', 'canceled']),
            'is_pickup' => $is_pickup,
            'is_delivery' => !$is_pickup,
            'instructions' => $this->faker->optional()->sentence(),
            'billing_same_as_shipping' => $this->faker->boolean(50),
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Checkout $checkout) {
            if ($checkout->is_pickup) {
                $checkout->update([
                    'pickup_date' => $this->faker->dateTimeBetween('+1 day', '+2 weeks')->format('Y-m-d'),
                    'pickup_time' => $this->faker->time('H:i'),
                    'delivery_date' => null,
                    'delivery_time' => null,
                    'delivery_address_id' => null,
                    'billing_address_id' => null,
                ]);
            } else { // is_delivery
                $checkout->update([
                    'pickup_date' => null,
                    'pickup_time' => null,
                    'delivery_date' => $this->faker->dateTimeBetween('+2 days', '+3 weeks')->format('Y-m-d'),
                    'delivery_time' => $this->faker->time('H:i'),
                    'delivery_address_id' => Address::factory(),
                    'billing_address_id' => $this->faker->boolean(25) ? Address::factory() : null, // 25% chance of having a separate billing address
                ]);
            }
        });
    }
}
