<?php

namespace App\Http\Controllers;

use App\Models\Checkout;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Controllers\Traits\ManagesCustomer;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CheckoutController extends Controller
{
    use AuthorizesRequests;
    use ManagesCustomer;

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

        $customer = $this->getCurrentCustomer();

        $cart = null;

        if ($customer) {
            // Find the user's most recently updated cart.
            $cart = $customer->carts()->latest()->first();
        } else {
            // For guests, find the cart using the session ID.
            $cart = \App\Models\Cart::where('session_id', $request->session()->getId())->whereNull('customer_id')->first();
        }

        if (!$cart) {
            return back()->withErrors(['cart' => 'No active shopping cart found.'])->with('error', 'No active shopping cart found.');
        }

        $checkoutData = [
            'cart_id' => $cart->id,
            'is_pickup' => $validatedData['is_pickup'],
            'is_delivery' => $validatedData['is_delivery'],
            'billing_address_id' => null,
            'billing_same_as_shipping' => $validatedData['billing_same_as_shipping'] ?? false,
        ];

        if ($validatedData['is_pickup']) {
            $checkoutData['pickup_date'] = $validatedData['pickup_date'];
            $checkoutData['pickup_time'] = $validatedData['pickup_time'];
        } else { // is_delivery
            $checkoutData['delivery_date'] = $validatedData['delivery_date'];
            $checkoutData['instructions'] = $validatedData['instructions'];
            $checkoutData['delivery_address_id'] = null;
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
        $customer = $this->getCurrentCustomer();
        // Validate only the fields that are present in the request.
        $validatedData = $request->validate([
            'is_pickup' => 'sometimes|boolean',
            'is_delivery' => 'sometimes|boolean',
            'pickup_date' => 'required_if:is_pickup,true|nullable|date|after_or_equal:today',
            'pickup_time' => 'required_if:is_pickup,true|nullable|date_format:H:i',
            'delivery_date' => 'required_if:is_delivery,true|nullable|date|after_or_equal:today',
            'instructions' => 'required_if:is_delivery,true|nullable|string|max:1000',
            'billing_same_as_shipping' => 'sometimes|boolean',
            'billing_address_id' => [
                'nullable',
                'exists:addresses,id',
            ],
            // The delivery_address_id is only required if is_pickup is false.
            'delivery_address_id' => [
                'nullable',
                'exists:addresses,id',
            ],
        ]);

        $checkout = Checkout::findOrFail($id);

        $this->authorize('update', $checkout);

        // First, fill the model with any validated data from the request.
        $checkout->fill($validatedData);

        // Handle pickup/delivery toggle logic if those fields are present
        if (isset($validatedData['is_pickup']) && $validatedData['is_pickup']) {
            $checkout->fill([
                'delivery_date' => null,
                'instructions' => null,
                'delivery_address_id' => null,
                'is_pickup' => true,
                'is_delivery' => false,
            ]);
        } elseif (isset($validatedData['is_delivery']) && $validatedData['is_delivery']) {
            $checkout->fill([
                'pickup_date' => null,
                'pickup_time' => null,
                'is_pickup' => false,
                'is_delivery' => true,
            ]);
        }

        $checkout->save();

        return back()->with('success', 'Checkout details updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        // Handle checkout deletion logic here
        /** @disregard p10008  */
        $checkout = Checkout::findOrFail($id);

        $this->authorize('delete', $checkout);

        $checkout->delete();

        return to_route('home')->with('success', 'Checkout deleted successfully.');
    }

    public function updateStatus(Request $request, $id)
    {
        $validatedData = $request->validate([
            'status' => ['required', Rule::in(['pending', 'processing', 'completed', 'cancelled'])],
        ]);

        $checkout = Checkout::findOrFail($id);

        $this->authorize('update', $checkout);

        $checkout->status = $validatedData['status'];
        $checkout->save();

        return back()->with('success', 'Checkout status updated successfully.');
    }
}
