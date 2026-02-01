<?php

namespace App\Http\Controllers;

use App\Models\Checkout;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Customer;
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
                $cart = Cart::where('customer_id', $guestCustomerId)->latest()->first();
                $customer = Customer::find($guestCustomerId);
            } else {
                $cart = Cart::where('session_id', $request->session()->getId())->whereNull('customer_id')->first();
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
                $customer = Customer::find($guestCustomerId);
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

        $checkout = Checkout::findOrFail($checkoutId);

        // Ensure the customer_id is set on the checkout for guests
        if (!$checkout->customer_id && $customer) {
            $checkout->customer_id = $customer->id;
            $checkout->save();
        }

        $addresses = $customer ? $customer->addresses()->pluck('id')->toArray() : [];
        if (isset($validated['billing_same_as_shipping']) && count($addresses) === 1) {
            // If there's only one address, use it for both billing and shipping.
            $validated['billing_address_id'] = $addresses[0];
            $validated['delivery_address_id'] = $addresses[0];
            $customer->addresses()->where('id', $addresses[0])->update(['billing' => true]);
        }

        $validated['customer_id'] = $customer?->id ?? $request->session()->get('guest_customer_id');

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
        // This is the final step to create the order record after successful payment.
        // It might redirect to a "Thank You" page.

        // If the customer was a guest, we must explicitly clear their session data
        // to ensure their next visit starts with a clean slate.
        if ($request->session()->has('guest_customer_id')) {
            // Optionally, remove the guest customer record from the sessions table
            DB::table('sessions')->where('guest_customer_id', $request->session()->get('guest_customer_id'))->delete();

            // 1. Remove all data from the session.
            $request->session()->flush();

            // 2. Save the now-empty session state to the database.
            $request->session()->save();

            // 3. Regenerate the session ID for a completely new session.
            $request->session()->regenerate();
        }

        return to_route('home')->with('success', 'Your order has been placed!');
    }

    /**
     * Store a new address during the checkout process for either a guest or authenticated user.
     */
    public function storeCheckoutAddress(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'shipping_address' => 'nullable|array',
            'shipping_address.street1' => 'required_with:shipping_address|string|max:255',
            'shipping_address.city' => 'required_with:shipping_address|string|max:255',
            'shipping_address.state' => 'required_with:shipping_address|string|max:255',
            'shipping_address.zip' => 'required_with:shipping_address|string|max:10',
            'shipping_address.phone' => 'required_with:shipping_address|string|max:20',

            'billing_address' => 'nullable|array',
            'billing_address.street1' => 'required_with:billing_address|string|max:255',
            'billing_address.city' => 'required_with:billing_address|string|max:255',
            'billing_address.state' => 'required_with:billing_address|string|max:255',
            'billing_address.zip' => 'required_with:billing_address|string|max:10',
            'billing_address.phone' => 'required_with:billing_address|string|max:20',

            'billing_same_as_shipping' => 'sometimes|boolean',
        ]);

        $customer = $this->getCurrentCustomer(); // This method already handles getting guest or auth customer

        if (!$customer) {
            return back()->withErrors(['session' => 'Your session has expired. Please try again.']);
        }

        $checkout = $customer->carts()->latest()->first()->checkout;

        DB::transaction(function () use ($customer, $checkout, $validated) {
            $shippingData = $validated['shipping_address'] ?? null;
            $billingData = $validated['billing_address'] ?? null;
            $isSameAsShipping = $validated['billing_same_as_shipping'] ?? false;

            // If billing is same as shipping, there should be shipping data.
            if ($isSameAsShipping) {
                if ($shippingData) {
                    $address = $customer->addresses()->create($shippingData + ['default' => true, 'billing' => true]);
                    $checkout->delivery_address_id = $address->id;
                    $checkout->billing_address_id = $address->id;
                    $checkout->billing_same_as_shipping = true;
                }
            } else {
                // If they are not the same, process them independently.
                if ($shippingData) {
                    $shippingAddress = $customer->addresses()->create($shippingData + ['default' => true, 'billing' => false]);
                    $checkout->delivery_address_id = $shippingAddress->id;
                }
                if ($billingData) {
                    $billingAddress = $customer->addresses()->create($billingData + ['billing' => true, 'default' => false]);
                    $checkout->billing_address_id = $billingAddress->id;
                }
                // Only set same as shipping to false if we are NOT setting it to true.
                $checkout->billing_same_as_shipping = false;
            }

            $checkout->save();
        });

        return redirect()->route('checkout-cart.index');
    }

    public function updateCheckoutAddress(Request $request, Address $address)
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

        $customer = Customer::find($guestCustomerId);
        $customer->load('addresses');

        // Return a redirect to refresh the page state
        return redirect()->route('checkout-cart.index')->with('success', 'Address updated.');
    }

    public function deleteCheckoutAddress(Request $request, Address $address)
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
            $this->authorize('update', $address);
        }

        $validated = $request->validate([
            'type' => ['required', Rule::in(['shipping', 'billing'])],
            'state' => ['required', 'boolean'],
        ]);

        $typeColumn = $validated['type'] === 'shipping' ? 'default' : 'billing';
        $isBeingSet = $validated['state'];

        $customer = Customer::find($guestCustomerId);

        DB::transaction(function () use ($customer, $address, $typeColumn, $isBeingSet) {
            if ($isBeingSet) {
                $customer->addresses()->where('id', '!=', $address->id)->update([$typeColumn => false]);
            }
            $address->update([$typeColumn => $isBeingSet]);
        });

        return redirect()->route('checkout-cart.index')->with('success', 'Default address updated.');
    }

    public function setBillingFromShipping(Request $request)
    {
        $guestCustomerId = $request->session()->get('guest_customer_id');
        if (!$guestCustomerId) {
            return back()->withErrors(['session' => 'Your session has expired. Please try again.']);
        }

        $customer = Customer::find($guestCustomerId);
        $checkout = $customer->carts()->latest()->first()->checkout;

        $this->authorize('update', $checkout);

        DB::transaction(function () use ($customer, $checkout) {
            $shippingAddress = $customer->addresses()->where('default', true)->first();

            if ($shippingAddress) {
                $shippingAddress->update(['billing' => true]);
                $checkout->billing_address_id = $shippingAddress->id;
                $checkout->billing_same_as_shipping = true;
                $checkout->save();
            }
        });

        return redirect()->route('checkout-cart.index');
    }

    public function storeDialogAddress(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phone' => 'required|string|max:20',
            'street1' => 'required|string|max:255',
            'street2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip' => 'required|string|max:10',
            'billing' => 'sometimes|boolean',
            'default' => 'sometimes|boolean',
        ]);

        $customer = $this->getCurrentCustomer();

        if (!$customer) {
            return back()->withErrors(['session' => 'Your session has expired. Please try again.']);
        }

        DB::transaction(function () use ($customer, $validated) {
            $address = $customer->addresses()->create($validated);

            if ($validated['billing']) {
                $customer->addresses()->where('id', '!=', $address->id)->update(['billing' => false]);
            }

            if ($validated['default']) {
                $customer->addresses()->where('id', '!=', $address->id)->update(['default' => false]);
            }
        });

        return redirect()->route('checkout-cart.index');
    }
}
