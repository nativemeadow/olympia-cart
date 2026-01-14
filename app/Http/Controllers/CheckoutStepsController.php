<?php

namespace App\Http\Controllers;

use App\Models\Checkout;
use App\Models\Address;
use App\Http\Controllers\Traits\ManagesCustomer;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutStepsController extends Controller
{
    use AuthorizesRequests;
    use ManagesCustomer;

    /**
     * Display the Inertia-based multi-step checkout page.
     */
    public function showCartCheckout(Request $request): Response
    {
        $customer = $this->getCurrentCustomer();
        $cart = null;

        if ($customer) {
            $cart = $customer->carts()->latest()->first();
        } else {
            $guestCustomerId = $request->session()->get('guest_customer_id');
            if ($guestCustomerId) {
                $cart = \App\Models\Cart::where('customer_id', $guestCustomerId)->latest()->first();
                $customer = \App\Models\Customer::find($guestCustomerId);
            } else {
                $cart = \App\Models\Cart::where('session_id', $request->session()->getId())->whereNull('customer_id')->first();
            }
        }

        // Eager load checkout with its relationships, or create a new one if it doesn't exist.
        $checkout = $cart ? Checkout::firstOrCreate(
            ['cart_id' => $cart->id],
            [
                'is_pickup' => $cart->is_pickup, // Default from cart
                'is_delivery' => !$cart->is_pickup, // Default from cart
            ]
        )->load(['deliveryAddress', 'billingAddress']) : null;

        if ($customer && $checkout) {
            // Eager load addresses if they haven't been loaded yet.
            $customer->loadMissing('addresses');

            // Find the user's default shipping and billing addresses.
            $defaultShippingAddress = $customer->addresses->firstWhere('default', true);
            $defaultBillingAddress = $customer->addresses->firstWhere('billing', true);

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
            'customer' => $customer,
            'checkout' => $checkout,
        ]);
    }

    /**
     * Process Step 1: Customer Information.
     */
    public function processStepOne(Request $request, $id): RedirectResponse
    {
        $customer = $this->getCurrentCustomer();
        if (!$customer) {
            $guestCustomerId = $request->session()->get('guest_customer_id');
            if ($guestCustomerId) {
                $customer = \App\Models\Customer::find($guestCustomerId);
            }
        }

        // Add validation and logic for customer info (Step 1)
        /** @disregard p10008  */
        $validated = $request->validate([
            'billing_address_id' => [
                'nullable',
                Rule::exists('addresses', 'id')->where('customer_id', $customer?->id),
            ],
            'billing_same_as_shipping' => 'sometimes|boolean',
            'delivery_address_id' => [
                'required_if:is_pickup,false',
                'nullable',
                Rule::exists('addresses', 'id')->where('customer_id', $customer?->id),
            ],
            'billing_same_as_shipping' => 'sometimes|required|boolean',
        ]);

        // Resolve checkout id from the method param, route params, or request input.
        /** @disregard p10008  */
        $checkoutId = $id ?? $request->route('id') ?? $request->input('id');
        if (!$checkoutId) {
            return back()->withErrors(['checkout' => 'Checkout id is required.']);
        }

        $addresses = $customer ? $customer->addresses()->pluck('id')->toArray() : [];
        if (isset($validated['billing_same_as_shipping']) && count($addresses) === 1) {
            // If there's only one address, use it for both billing and shipping.
            $validated['billing_address_id'] = $addresses[0];
            $validated['delivery_address_id'] = $addresses[0];
            $customer->addresses()->where('id', $addresses[0])->update(['billing' => true]);
        }

        $checkout = Checkout::findOrFail($checkoutId);

        $this->authorize('update', $checkout);

        $checkout->update($validated);

        // For guests, you might store this info in the session.
        //return back()->with('success', 'Customer information saved.');
        return redirect()->route('checkout-cart.index');
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

    /**
     * Store a new address for a guest customer.
     */
    public function storeGuestAddress(Request $request)
    {
        $validated = $request->validate([
            //'first_name' => 'required|string|max:255',
            //'last_name' => 'required|string|max:255',
            'street1' => 'required|string|max:255',
            'street2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip' => 'required|string|max:10',
            'phone' => 'required|string|max:20',
            //'email' => 'required|email|max:255',
            'type' => ['required', Rule::in(['shipping', 'billing'])],
            'billing_same_as_shipping' => 'sometimes|boolean',
        ]);

        $guestCustomerId = $request->session()->get('guest_customer_id');
        if (!$guestCustomerId) {
            return response()->json(['message' => 'Guest session not found.'], 404);
        }

        $customer = \App\Models\Customer::find($guestCustomerId);
        if (!$customer) {
            return response()->json(['message' => 'Guest customer not found.'], 404);
        }

        $addressData = collect($validated)->except(['type', 'billing_same_as_shipping'])->toArray();
        $type = $validated['type'];
        $billingSameAsShipping = $validated['billing_same_as_shipping'] ?? false;

        $address = $customer->addresses()->create($addressData);

        $checkout = $customer->carts()->latest()->first()->checkout;

        if ($type === 'shipping') {
            $customer->addresses()->where('id', '!=', $address->id)->update(['default' => false]);
            $address->update(['default' => true]);
            $checkout->update(['delivery_address_id' => $address->id]);

            if ($billingSameAsShipping) {
                $customer->addresses()->where('id', '!=', $address->id)->update(['billing' => false]);
                $address->update(['billing' => true]);
                $checkout->update(['billing_address_id' => $address->id, 'billing_same_as_shipping' => true]);
            }
        } elseif ($type === 'billing') {
            $customer->addresses()->where('id', '!=', $address->id)->update(['billing' => false]);
            $address->update(['billing' => true]);
            $checkout->update(['billing_address_id' => $address->id]);
        }

        // Return the updated checkout object
        return response()->json($checkout->load(['deliveryAddress', 'billingAddress']));
    }

    public function updateGuestAddress(Request $request, Address $address)
    {
        $guestCustomerId = $request->session()->get('guest_customer_id');
        if (!$guestCustomerId || $address->customer_id != $guestCustomerId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'street1' => 'sometimes|required|string|max:255',
            'street2' => 'nullable|string|max:255',
            'city' => 'sometimes|required|string|max:255',
            'state' => 'sometimes|required|string|max:255',
            'zip' => 'sometimes|required|string|max:10',
            'phone' => 'sometimes|required|string|max:20',
            'email' => 'sometimes|required|email|max:255',
        ]);

        $address->update($validated);

        $customer = \App\Models\Customer::find($guestCustomerId);
        $customer->load('addresses');

        // Return a redirect to refresh the page state
        return redirect()->route('checkout-cart.index')->with('success', 'Address updated.');
    }

    public function destroyGuestAddress(Request $request, Address $address)
    {
        $guestCustomerId = $request->session()->get('guest_customer_id');
        if (!$guestCustomerId || $address->customer_id != $guestCustomerId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $address->delete();

        return redirect()->route('checkout-cart.index')->with('success', 'Address removed.');
    }

    public function setGuestDefaultAddress(Request $request, Address $address)
    {
        $guestCustomerId = $request->session()->get('guest_customer_id');
        if (!$guestCustomerId || $address->customer_id != $guestCustomerId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'type' => ['required', Rule::in(['shipping', 'billing'])],
            'state' => ['required', 'boolean'],
        ]);

        $typeColumn = $validated['type'] === 'shipping' ? 'default' : 'billing';
        $isBeingSet = $validated['state'];

        $customer = \App\Models\Customer::find($guestCustomerId);

        DB::transaction(function () use ($customer, $address, $typeColumn, $isBeingSet) {
            if ($isBeingSet) {
                $customer->addresses()->where('id', '!=', $address->id)->update([$typeColumn => false]);
            }
            $address->update([$typeColumn => $isBeingSet]);
        });

        return redirect()->route('checkout-cart.index')->with('success', 'Default address updated.');
    }
}
