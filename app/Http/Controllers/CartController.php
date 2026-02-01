<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\Cart;
use App\Models\Customer;
use App\Http\Controllers\Traits\ManagesCustomer;

class CartController extends Controller
{
    use ManagesCustomer;

    public function index()
    {
        $customer = $this->getCurrentCustomer();

        $cart = null;
        if ($customer) {
            $cart = Cart::with('items.product')->where('customer_id', $customer->id)->where('status', 'active')->first();
        } else {
            $cart = Cart::with('items.product')->where('session_id', session()->getId())->where('status', 'active')->first();
        }

        /* get the checkout information if it exists, may not exist so check for that as well */

        $checkout = $cart ? $cart->checkout : null;

        return Inertia::render('shopping-cart/show', [
            'cart' => $cart,
            'checkout' => $checkout,
            'guest_checkout_email' => $customer?->email,
        ]);
    }

    public function addItem(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'sku' => 'required|string',
            'title' => 'required|string',
            'price' => 'required|numeric',
            'quantity' => 'required|integer|min:1',
            'unit' => 'nullable|string',
            'image' => 'nullable|string',
            'product_slug' => 'nullable|string',
            'category_slug' => 'nullable|string',
        ]);

        $customer = $this->getCurrentCustomer();

        $cart = $this->getOrCreateCart($request);

        // Check if the item (by SKU and unit) already exists in the cart
        $cartItem = $cart->items()->where('sku', $validated['sku'])->where('unit', $validated['unit'])->first();

        if ($cartItem) {
            // Item exists, update quantity
            $cartItem->quantity += $validated['quantity'];

            $cartItem->save();
        } else {
            // Item does not exist, create a new one
            $validated['customer_id'] = $customer ? $customer->id : null;
            $cart->items()->create($validated);
        }

        $cart->recalculateTotal();

        $message = sprintf('Successfully added %d x %s to your cart.', $validated['quantity'], $validated['title']);

        // return response()->json(['message' => $message]);
        // Redirect back with a success message
        return redirect()->back()->with([
            'success' => $message,
            'cart' => $cart,
        ]);
    }

    /**
     * Get the active cart for the current user or session, or create a new one.
     *
     * @param \Illuminate\Http\Request $request
     * @return \App\Models\Cart
     */
    private function getOrCreateCart(Request $request): Cart
    {
        $customer = $this->getCurrentCustomer();
        $sessionId = $request->session()->getId();

        // Case 1: A logged-in user or a guest with a customer record.
        if ($customer) {
            $cart = Cart::where('customer_id', $customer->id)->where('status', 'active')->first();

            // Check for a guest cart from the current session to merge.
            $sessionCart = Cart::where('session_id', $sessionId)->whereNull('customer_id')->first();

            if ($cart && $sessionCart) {
                // Both a user cart and a session cart exist. Merge them.
                $sessionCart->items()->update(['cart_id' => $cart->id]);
                $cart->recalculateTotal(); // Recalculate total after merging.
                $sessionCart->delete();
                return $cart;
            }

            if ($sessionCart) {
                // Only a session cart exists. Assign it to the customer.
                $sessionCart->customer_id = $customer->id;
                $sessionCart->session_id = $sessionId; // Ensure session ID is updated.
                $sessionCart->save();
                return $sessionCart;
            }

            if (!$cart && !$sessionCart) {
                // No cart exists for the customer or session. Create a new one.
                return Cart::create([
                    'customer_id' => $customer->id,
                    'status' => 'active',
                    'total' => 0,
                    'cart_uuid' => Str::uuid(),
                    'session_id' => $sessionId,
                ]);
            }

            if ($cart) {
                return $cart;
            }

            // No cart exists for the customer or session. Create a new one.
            return Cart::create([
                'customer_id' => $customer->id,
                'status' => 'active',
                'total' => 0,
                'cart_uuid' => Str::uuid(),
                'session_id' => $sessionId,
            ]);
        }

        // Case 2: A truly anonymous guest.
        // Find or create a cart based on session ID.
        return Cart::firstOrCreate(
            ['session_id' => $sessionId, 'customer_id' => null, 'status' => 'active'],
            ['total' => 0, 'cart_uuid' => Str::uuid()]
        );
    }
}
