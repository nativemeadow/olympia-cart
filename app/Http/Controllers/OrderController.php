<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Constants\StatusCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OrderController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display the specified resource.
     */
    public function show(): Response
    {
        $user = Auth::user();

        // Fetch the latest order for the authenticated user
        $order = Order::where('user_id', $user->id)->latest()->firstOrFail();

        // Eager load relationships to prevent N+1 query issues
        $order->load(['items.product', 'shippingAddress', 'billingAddress', 'user']);

        // Map customer details for the frontend
        $customer = $order->user ?
            ['name' => $order->user->name, 'email' => $order->user->email] :
            ['name' => $order->guest_name, 'email' => $order->guest_email];

        // Add customer to the order object before sending to the view
        $order->customer = $customer;

        return Inertia::render('checkout-cart/step-five/page', [
            'order' => $order,
        ]);
    }

    /**
     * Store a newly created order in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {

        $user = $request->user();
        $cart = null;
        $checkout = null;

        if ($user) {
            // Find the user's most recently updated cart.
            $cart = $user->carts()->latest()->first();
            $checkout = \App\Models\Checkout::where('cart_id', $cart->id)->first();
        }

        $is_guest = $cart->session_id === session()->getId() ? true : false;

        if (!$cart) {
            return back()->withErrors(['cart' => 'No active shopping cart found.'])->with('error', 'No active shopping cart found.');
        }

        $order = null;

        $orderStatus = StatusCode::getOrderStatus();
        DB::transaction(function () use ($cart, $user, $checkout, $is_guest, $orderStatus, &$order) {
            // Create the Order
            $order = Order::create([
                'user_id' => $user->id,
                'status' => $orderStatus['PENDING'], // Set initial status to 'pending'
                'total' => $cart->total, // Assuming cart model has a 'total' accessor
                'guest_name' => $is_guest ? $user->first_name . ' ' . $user->last_name ?? 'Guest' : null,
                'guest_email' => $is_guest ? $user->email ?? null : null,
                'shipping_address_id' =>  $checkout->delivery_address_id,
                'billing_address_id' => $checkout->billing_address_id,
            ]);

            // Create OrderItems from CartItems
            foreach ($cart->items as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'sku' => $cartItem->sku,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->price,
                    'unit' => $cartItem->unit,
                    'image' => $cartItem->image,
                    'title' => $cartItem->title,
                    'category_slug' => $cartItem->category_slug,
                    'product_slug' => $cartItem->product_slug,
                ]);
            }

            // Optional: You can clear the cart here if you want.
            // $cart->items()->delete();
        });

        return back()->with('success', 'Order created successfully.');
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        // Authorization check (if needed)
        $this->authorize('update', $order);

        $validated = $request->validate([
            'status' => 'required|string',
            'total' => 'required|numeric',
            'delivery_address_id' => 'nullable|exists:addresses,id',
            'billing_address_id' => 'required|exists:addresses,id',
        ]);

        $order->update($validated);

        return back()->with('success', 'Order updated successfully.');
    }

    public function delete(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        // Authorization check (if needed)
        $this->authorize('delete', $order);

        $order->delete();

        return response()->json([
            'message' => 'Order deleted successfully.',
        ]);
    }
}
