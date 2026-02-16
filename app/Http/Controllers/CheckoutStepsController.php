<?php

namespace App\Http\Controllers;

use App\Models\Checkout;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Customer;
use App\Http\Controllers\Traits\ManagesCustomer;
use App\Http\Controllers\Traits\ClearsGuestSession;
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
    use ClearsGuestSession;

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
    public function processStepTwo(Request $request): RedirectResponse
    {
        $customer = $this->getCurrentCustomer();
        if (!$customer) {
            return back()->withErrors(['session' => 'Your session has expired. Please try again.']);
        }

        $cart = $customer->carts()->where('status', 'active')->latest()->first();
        if (!$cart || !$cart->checkout) {
            return back()->withErrors(['checkout' => 'Could not find an active checkout session.']);
        }
        $checkout = $cart->checkout;

        $this->authorize('update', $checkout);

        $validated = $request->validate([
            'is_pickup' => 'sometimes|boolean',
            'pickup_date' => 'required_if:is_pickup,true|nullable|date|after_or_equal:today',
            'pickup_time' => 'required_if:is_pickup,true|nullable|string',
            'is_delivery' => 'sometimes|boolean',
            'delivery_date' => 'required_if:is_delivery,true|nullable|date|after_or_equal:today',
            'instructions' => 'nullable|string|max:1000',
        ]);

        $checkout->update($validated);

        return redirect()->route('checkout-cart.index');
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
            'shipping_address.name' => 'sometimes|string|max:255',
            'shipping_address.street1' => 'required_with:shipping_address|string|max:255',
            'shipping_address.street2' => 'nullable|string|max:255',
            'shipping_address.city' => 'required_with:shipping_address|string|max:255',
            'shipping_address.state' => 'required_with:shipping_address|string|max:255',
            'shipping_address.zip' => 'required_with:shipping_address|string|max:10',
            'shipping_address.phone' => 'required_with:shipping_address|string|max:20',

            'billing_address' => 'nullable|array',
            'billing_address.name' => 'sometimes|string|max:255',
            'billing_address.street1' => 'required_with:billing_address|string|max:255',
            'billing_address.street2' => 'nullable|string|max:255',
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
        $customer = $this->getCurrentCustomer();
        if (!$customer || $address->customer_id !== $customer->id) {
            abort(403, 'Unauthorized action.');
        }

        $this->authorize('update', $address);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'street1' => 'sometimes|required|string|max:255',
            'street2' => 'nullable|string|max:255',
            'city' => 'sometimes|required|string|max:255',
            'state' => 'sometimes|required|string|max:255',
            'zip' => 'sometimes|required|string|max:10',
            'phone' => 'sometimes|required|string|max:20',
            'email' => 'sometimes|email|max:255',
            'billing' => 'sometimes|boolean',
            'default' => 'sometimes|boolean',
        ]);

        DB::transaction(function () use ($customer, $address, $validated) {
            // If the 'billing' flag is being set to true, we need to ensure
            // no other address for this customer is also marked as the billing address.
            if (isset($validated['billing']) && $validated['billing']) {
                $customer->addresses()->where('id', '!=', $address->id)->update(['billing' => false]);
            }

            // If the 'default' flag is being set to true, we need to ensure
            // no other address for this customer is also marked as the default shipping address.
            if (isset($validated['default']) && $validated['default']) {
                $customer->addresses()->where('id', '!=', $address->id)->update(['default' => false]);
            }

            // Now, update the address with all validated data.
            $address->update($validated);
        });


        // Return a redirect to refresh the page state
        return redirect()->route('checkout-cart.index')->with('success', 'Address updated.');
    }

    public function deleteCheckoutAddress(Request $request, Address $address)
    {

        $this->authorize('delete', $address);

        $address->delete();

        return redirect()->route('checkout-cart.index')->with('success', 'Address removed.');
    }

    public function setDefaultAddress(Request $request, Address $address)
    {
        $customer = $this->getCurrentCustomer();
        if (!$customer || $customer->id !== $address->customer_id) {
            // Either no customer found, or the address does not belong to them.
            abort(403, 'Unauthorized action.');
        }

        // Authorize that the current user can update this address.
        $this->authorize('update', $address);

        $validated = $request->validate([
            'type' => ['required', Rule::in(['shipping', 'billing'])],
            'state' => ['required', 'boolean'],
        ]);

        $typeColumn = $validated['type'] === 'shipping' ? 'default' : 'billing';
        $isBeingSet = $validated['state'];

        DB::transaction(function () use ($customer, $address, $typeColumn, $isBeingSet) {
            // If a new default is being set, first clear any other defaults of the same type.
            if ($isBeingSet) {
                $customer->addresses()->where('id', '!=', $address->id)->update([$typeColumn => false]);
            }
            // Now, set the state of the target address.
            $address->update([$typeColumn => $isBeingSet]);
        });

        return redirect()->route('checkout-cart.index')->with('success', 'Default address updated.');
    }

    public function setBillingFromShipping(Request $request)
    {
        $customer = $this->getCurrentCustomer();

        if (!$customer) {
            return back()->withErrors(['session' => 'Your session has expired. Please try again.']);
        }

        $cart = $customer->carts()->where('status', 'active')->latest()->first();
        if (!$cart || !$cart->checkout) {
            return back()->withErrors(['checkout' => 'Could not find an active checkout session.']);
        }
        $checkout = $cart->checkout;

        $this->authorize('update', $checkout);

        DB::transaction(function () use ($customer, $checkout) {
            $shippingAddress = $customer->addresses()->where('default', true)->first();

            if ($shippingAddress) {
                // Also mark any other address as not the default billing address
                $customer->addresses()->where('id', '!=', $shippingAddress->id)->update(['billing' => false]);

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
            'name' => 'sometimes|string|max:255',
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

    /**
     * Flash a session variable to indicate a checkout has been completed.
     */
    public function clearGuestSession(Request $request)
    {
        $this->clearGuestSessionIfPresent($request);

        return response()->json(['status' => 'session_removed']);
    }
}
