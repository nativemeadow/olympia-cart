<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\ManagesCustomer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Constants\StatusCode;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OrderController extends Controller
{
    use AuthorizesRequests;
    use ManagesCustomer;

    public function confirmation(Request $request): JsonResponse
    {
        $order = null;
        $customer = $this->getCurrentCustomer();
        $customerId = $customer->id ?? null;

        if ($request->session()->has('order_customer_id')) {
            $customerId = $request->session()->get('order_customer_id');
        }

        if ($customerId) {
            $order = Order::where('customer_id', $customerId)
                ->with(['items.product', 'shippingAddress', 'billingAddress', 'customer'])
                ->latest()
                ->first();
        } else {
            $checkoutId = $request->session()->get('checkout_id');
            if ($checkoutId) {
                $order = Order::where('checkout_id', $checkoutId)
                    ->with(['items.product', 'shippingAddress', 'billingAddress'])
                    ->latest()
                    ->first();
            }
        }

        return response()->json(['order' => $order]);
    }

    /**
     * Display the specified resource.
     */
    public function show(): \Inertia\Response
    {
        $customer = $this->getCurrentCustomer();

        // Fetch the latest order for the authenticated user
        $order = Order::where('customer_id', $customer->id)->latest()->firstOrFail();

        // Eager load relationships to prevent N+1 query issues
        $order->load(['items.product', 'shippingAddress', 'billingAddress', 'customer']);

        // Map customer details for the frontend
        $customer = $order->customer ?
            ['name' => $order->customer->name, 'email' => $order->customer->email] :
            ['name' => $order->guest_name, 'email' => $order->guest_email];

        // Add customer to the order object before sending to the view
        $order->customer = $customer;

        return Inertia::render('checkout-cart/step-five/page', [
            'order' => $order,
        ]);
    }

    public function index(): \Inertia\Response
    {
        $customer = $this->getCurrentCustomer();

        // Fetch all orders for the authenticated user
        $orders = Order::where('customer_id', $customer->id)
            ->with(['items.product', 'shippingAddress', 'billingAddress'])
            ->latest()
            ->get();

        return Inertia::render('settings/orders', [
            'orders' => $orders,
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
        $customer = $this->getCurrentCustomer();
        $cart = null;
        $checkout = null;

        if ($customer) {
            // Find the customer's most recently updated cart.
            $cart = $customer->carts()->latest()->first();
        } else {
            // For guests, find the cart using the session ID.
            $cart = \App\Models\Cart::where('session_id', $request->session()->getId())->whereNull('customer_id')->first();
        }

        if (!$cart) {
            return back()->withErrors(['cart' => 'No active shopping cart found.'])->with('error', 'No active shopping cart found.');
        }

        // Now that we have a cart, find the associated checkout.
        $checkout = \App\Models\Checkout::where('cart_id', $cart->id)->first();

        if (!$checkout) {
            return back()->withErrors(['checkout' => 'No active checkout session found.'])->with('error', 'No active checkout session found.');
        }

        $order = null;
        $orderStatus = StatusCode::getOrderStatus();

        DB::transaction(function () use ($cart, $customer, $checkout, $orderStatus, &$order) {
            // Use updateOrCreate to find an existing order for this checkout or create a new one.
            $order = Order::updateOrCreate(
                ['checkout_id' => $checkout->id], // Find order by checkout_id
                [
                    'customer_id' => $customer?->id,
                    'status' => $orderStatus['PENDING'],
                    'total' => $cart->total,
                    'guest_name' => $customer ? ($customer->first_name . ' ' . $customer->last_name) : 'Guest',
                    'guest_email' => $customer?->email,
                    'shipping_address_id' =>  $checkout->delivery_address_id,
                    'billing_address_id' => $checkout->billing_address_id,
                ]
            );
            // If we are updating an existing order, clear out the old items.
            $order->items()->delete();

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

    /**
     * Deletes an order based on the checkout ID.
     *
     * @param int $checkoutId
     * @return void
     */
    public static function deleteOrderByCheckoutId(int $checkoutId): void
    {
        // Find the order associated with the checkout.
        $order = Order::where('checkout_id', $checkoutId)->first();

        if ($order) {
            // The transaction ensures that deleting items and the order happens atomically.
            DB::transaction(function () use ($order) {
                // Delete all associated order items.
                $order->items()->delete();
                // Delete the order itself.
                $order->delete();
            });
        }
    }
}
