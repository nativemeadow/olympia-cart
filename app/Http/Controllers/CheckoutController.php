<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Checkout;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        return view('checkout.index');
    }

    public function create(Request $request)
    {
        // The 'create' method should typically show the form/page for creating a resource.
        // The actual creation logic will be in the 'store' method.
        return view('checkout.create');
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'is_pickup' => 'required|boolean',
            'is_delivery' => 'required|boolean',
            'pickup_date' => 'required_if:is_pickup,true|nullable|date|after_or_equal:today',
            'pickup_time' => 'required_if:is_pickup,true|nullable|date_format:H:i',
            'delivery_date' => 'required_if:is_delivery,true|nullable|date|after_or_equal:today',
            'instructions' => 'required_if:is_delivery,true|nullable|string|max:1000',
            'billing_same_as_shipping' => 'sometimes|boolean',
        ]);

        $user = $request->user();
        $cart = null;

        if ($user) {
            // Find the user's most recently updated cart.
            $cart = $user->carts()->latest()->first();
        } else {
            // For guests, find the cart using the session ID.
            $cart = \App\Models\Cart::where('session_id', $request->session()->getId())->whereNull('user_id')->first();
        }

        if (!$cart) {
            return back()->withErrors(['cart' => 'No active shopping cart found.'])->with('error', 'No active shopping cart found.');
        }

        $billingAddress = $user?->addresses()->where('billing', true)->first();

        $checkoutData = [
            'cart_id' => $cart->id,
            'is_pickup' => $validatedData['is_pickup'],
            'is_delivery' => $validatedData['is_delivery'],
            'billing_address_id' => $billingAddress?->id,
            'billing_same_as_shipping' => $validatedData['billing_same_as_shipping'] ?? false,
        ];

        if ($validatedData['is_pickup']) {
            $checkoutData['pickup_date'] = $validatedData['pickup_date'];
            $checkoutData['pickup_time'] = $validatedData['pickup_time'];
        } else { // is_delivery
            $checkoutData['delivery_date'] = $validatedData['delivery_date'];
            $checkoutData['instructions'] = $validatedData['instructions'];
            $checkoutData['delivery_address_id'] = $billingAddress?->id; // Default to billing address
        }

        $checkout = Checkout::create($checkoutData);

        // return to_route('checkout.show', $checkout)->with('success', 'Checkout created successfully.');
        return back()->with('success', 'Checkout created successfully.');
    }

    public function show(Request $request, $id)
    {
        return view('checkout.show', ['id' => $id]);
    }

    public function edit(Request $request, $id)
    {
        return view('checkout.edit', ['id' => $id]);
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'is_pickup' => 'required|boolean',
            'is_delivery' => 'required|boolean',
            'pickup_date' => 'required_if:is_pickup,true|nullable|date|after_or_equal:today',
            'pickup_time' => 'required_if:is_pickup,true|nullable|date_format:H:i',
            'delivery_date' => 'required_if:is_delivery,true|nullable|date|after_or_equal:today',
            'instructions' => 'required_if:is_delivery,true|nullable|string|max:1000',
            'billing_same_as_shipping' => 'sometimes|boolean',
        ]);

        $checkout = Checkout::findOrFail($id);

        $this->authorize('update', $checkout);

        if ($validatedData['is_pickup']) {
            $checkout->fill([
                'pickup_date' => $validatedData['pickup_date'],
                'pickup_time' => $validatedData['pickup_time'],
                'delivery_date' => null,
                'instructions' => null,
                'is_pickup' => true,
                'is_delivery' => false,
            ]);
        } else { // is_delivery
            $checkout->fill($validatedData);
        }

        $checkout->save();

        return back()->with('success', 'Checkout details updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        // Handle checkout deletion logic here
        $checkout = Checkout::findOrFail($id);

        $this->authorize('delete', $checkout);

        $checkout->delete();

        return to_route('home')->with('success', 'Checkout deleted successfully.');
    }

    /**
     * Display the Inertia-based multi-step checkout page.
     */
    public function showCartCheckout(Request $request): Response
    {
        /** @var ?User $user */
        $user = $request->user();

        // Eager load addresses if the user is authenticated
        $user?->load('addresses');

        return Inertia::render('checkout-cart/index', [
            'customer' => $user,
        ]);
    }

    /**
     * Process Step 1: Customer Information.
     */
    public function processStepOne(Request $request, $id): RedirectResponse
    {
        // Add validation and logic for customer info (Step 1)
        $validated = $request->validate([
            'delivery_address_id' => 'nullable|exists:addresses,id',
            'billing_address_id' => 'nullable|exists:addresses,id',
        ]);

        $checkout = Checkout::findOrFail($id);

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
