<?php

namespace App\Http\Controllers;

use App\Models\Checkout;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutStepsController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display the Inertia-based multi-step checkout page.
     */
    public function showCartCheckout(Request $request): Response
    {
        /** @var ?User $user */
        $user = $request->user();

        // Find the latest checkout session for the user or guest.
        if ($user) {
            $cart = $user->carts()->latest()->first();
        } else {
            $cart = \App\Models\Cart::where('session_id', $request->session()->getId())->whereNull('user_id')->first();
        }

        // Eager load checkout with its relationships
        $checkout = $cart ? Checkout::with(['deliveryAddress', 'billingAddress'])->where('cart_id', $cart->id)->first() : null;

        if ($user && $checkout) {
            // Eager load addresses if they haven't been loaded yet.
            $user->loadMissing('addresses');

            // Find the user's default shipping and billing addresses.
            $defaultShippingAddress = $user->addresses->firstWhere('default', true);
            $defaultBillingAddress = $user->addresses->firstWhere('billing', true);

            // Prepare the data for the update.
            $updateData = [
                'delivery_address_id' => $defaultShippingAddress?->id,
                'billing_address_id' => $defaultBillingAddress?->id,
            ];

            // Update the checkout model with the latest default addresses.
            $checkout->update($updateData);

            // Reload the relations to ensure the response has the updated address objects.
            $checkout->load(['deliveryAddress', 'billingAddress']);
        }

        return Inertia::render('checkout-cart/index', [
            'customer' => $user,
            'checkout' => $checkout,
        ]);
    }

    /**
     * Process Step 1: Customer Information.
     */
    public function processStepOne(Request $request, $id): RedirectResponse
    {
        // Add validation and logic for customer info (Step 1)
        /** @disregard p10008  */
        $validated = $request->validate([
            'delivery_address_id' => [
                'nullable',
                Rule::exists('addresses', 'id')->where('user_id', $request->user()?->id),
            ],
            'billing_address_id' => [
                'nullable',
                Rule::exists('addresses', 'id')->where('user_id', $request->user()?->id),
            ],
            'billing_same_as_shipping' => 'sometimes|boolean',
        ]);

        // Resolve checkout id from the method param, route params, or request input.
        /** @disregard p10008  */
        $checkoutId = $id ?? $request->route('id') ?? $request->input('id');
        if (!$checkoutId) {
            return back()->withErrors(['checkout' => 'Checkout id is required.']);
        }

        $checkout = Checkout::findOrFail($checkoutId);

        $this->authorize('update', $checkout);

        $checkout->update($validated);

        // For guests, you might store this info in the session.
        return back()->with('success', 'Customer information saved.');
    }

    /**
     * Process Step 2: Shipping & Delivery.
     */
    public function processStepTwo(Request $request)
    {
        // This can use logic similar to your existing `store` method,
        // but adapted for guest users (e.g., using session for cart).
        return back()->with('success', 'Shipping & Delivery information saved.');
    }

    /**
     * Process Step 3: Review.
     */
    public function processStepThree(Request $request)
    {
        // This step might not need a POST if it's just for review.
        // If it does (e.g., final confirmation before payment), add logic here.
        return back()->with('success', 'Order reviewed.');
    }

    /**
     * Process Step 4: Payment.
     */
    public function processPayment(Request $request)
    {
        // Add validation and logic for payment processing (Step 4)
        // This will likely involve a payment gateway integration and creating the final Order.
        return back()->with('success', 'Payment processed successfully.');
    }

    /**
     * Process Step 5: Order Confirmation.
     */
    public function processStepFive(Request $request)
    {
        // This is likely the final step to create the order record after successful payment.
        // It might redirect to a "Thank You" page.
        return to_route('home')->with('success', 'Your order has been placed!');
    }
}
