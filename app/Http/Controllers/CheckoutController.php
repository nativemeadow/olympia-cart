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
        // Validate only the fields that are present in the request.
        $validatedData = $request->validate([
            'is_pickup' => 'sometimes|boolean',
            'is_delivery' => 'sometimes|boolean',
            'pickup_date' => 'required_if:is_pickup,true|nullable|date|after_or_equal:today',
            'pickup_time' => 'required_if:is_pickup,true|nullable|date_format:H:i',
            'delivery_date' => 'required_if:is_delivery,true|nullable|date|after_or_equal:today',
            'instructions' => 'required_if:is_delivery,true|nullable|string|max:1000',
            'billing_same_as_shipping' => 'sometimes|boolean',
            'delivery_address_id' => 'nullable|exists:addresses,id',
            'billing_address_id' => 'nullable|exists:addresses,id',
            'billing_address_id' => [
                'required',
                'exists:addresses,id,user_id,' . $request->user()->id,
            ],
            //'is_pickup' => 'required|boolean',
            // The delivery_address_id is only required if is_pickup is false.
            'delivery_address_id' => [
                'required_if:is_delivery,true',
                'nullable',
                'exists:addresses,id,user_id,' . $request->user()->id,
            ],
        ]);

        $checkout = Checkout::findOrFail($id);

        $this->authorize('update', $checkout);

        // Handle pickup/delivery toggle logic if those fields are present
        if (isset($validatedData['is_pickup'])) {
            if ($validatedData['is_pickup']) {
                $checkout->fill([
                    'pickup_date' => $validatedData['pickup_date'] ?? $checkout->pickup_date,
                    'pickup_time' => $validatedData['pickup_time'] ?? $checkout->pickup_time,
                    'delivery_date' => null,
                    'instructions' => null,
                    'is_pickup' => true,
                    'is_delivery' => false,
                ]);
            }
        }

        // Fill the model with any other validated data from the request.
        // This will handle address ID updates and other partial updates.
        $checkout->fill($validatedData);

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
