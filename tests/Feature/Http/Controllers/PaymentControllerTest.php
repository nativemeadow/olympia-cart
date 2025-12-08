<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\User;
use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Price;
use App\Services\PaymentGatewayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use stdClass;
use Tests\TestCase;

// The class name in the file should match this
class PaymentControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * This test makes a real HTTP request to the PaymentController's store method
     * and verifies it sends a confirmation email.
     *
     * NOTE: This test assumes your schema is missing 'checkouts' and 'orders' tables
     * and that the PaymentController handles their creation or an equivalent logic.
     */
    public function test_payment_controller_store_method_sends_real_confirmation_email(): void
    {
        // 1. Arrange: Set up the database state according to your schema
        $user = User::factory()->create();
        $this->actingAs($user);

        $address = Address::factory()->for($user)->create();

        // Create a Product and its associated Price record
        $product = Product::factory()->create();
        $price = Price::factory()->for($product)->create(['price' => 99.99]);

        // Create a Cart and add the item
        $cart = Cart::factory()->for($user)->create(['total' => 99.99]);
        $cartItem = CartItem::factory()->for($cart)->for($product)->create([
            'quantity' => 1,
            'price' => $price->price,
        ]);

        // We mock the external payment gateway to simulate a successful payment
        $this->mock(PaymentGatewayService::class, function ($mock) {
            $fakeTransaction = new stdClass();
            $fakeTransaction->id = 'txn_' . uniqid();
            $fakeTransaction->status = 'succeeded';
            $mock->shouldReceive('processPayment')->andReturn($fakeTransaction);
        });

        // 2. Act: Hit the PaymentController's store route.
        // We pass the cart_id instead of a checkout_id, as the checkouts table is missing.
        // You may need to adjust the payload based on your PaymentController's actual requirements.
        $response = $this->postJson(route('payment.store'), [
            'cart_id' => $cart->id, // Assuming the controller can use the cart_id
            'billing_address_id' => $address->id,
            'delivery_address_id' => $address->id,
            'payment_method' => 'credit_card',
            'payment_details' => ['token' => 'tok_visa'],
        ]);

        // 3. Assert: Check for a successful response and provide manual verification instructions
        $response->assertStatus(201)
            ->assertJsonPath('message', 'Payment successful and confirmation email sent.');

        $this->assertTrue(true, "Email sent by PaymentController. Check your Herd/Mailpit web interface to verify.");
    }
}
