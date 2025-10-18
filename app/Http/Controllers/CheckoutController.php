<?php

namespace App\Http\Controllers;

use App\Models\Checkout;

use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    //
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
            'instructions' => 'required_if:is_delivery,true|nullable|string|max:1000'
        ]);

        $user = $request->user();
        // Find the user's most recently updated cart. This is more reliable than a simple hasOne relationship.
        $cart = $user->carts()->latest()->first();

        if (!$cart) {
            return back()->withErrors(['cart' => 'No active shopping cart found.'])->with('error', 'No active shopping cart found.');
        }

        $billingAddress = $user->addresses()->where('billing', true)->first();

        $checkoutData = [
            'cart_id' => $cart->id,
            'is_pickup' => $validatedData['is_pickup'],
            'is_delivery' => $validatedData['is_delivery'],
            'billing_address_id' => $billingAddress?->id,
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
        ]);

        $checkout = Checkout::findOrFail($id);

        // Optional: Add authorization to ensure the user owns this checkout.
        // if ($checkout->cart->user_id !== $request->user()->id) {
        //     abort(403);
        // }

        if ($validatedData['is_pickup']) {
            $checkout->fill([
                'pickup_date' => $validatedData['pickup_date'],
                'pickup_time' => $validatedData['pickup_time'],
                'delivery_date' => null,
                'instructions' => null,
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
    }
}
