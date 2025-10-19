<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Cart;
use App\Models\Category;

class CartController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $cart = null;
        if ($user) {
            $cart = Cart::with('items.product')->where('user_id', $user->id)->first();
        } else {
            $cart = Cart::with('items.product')->where('session_id', session()->getId())->first();
        }

        /* get the checkout information if it exists, may not exist so check for that as well */

        $checkout = $cart ? $cart->checkout : null;

        return Inertia::render('shopping-cart/show', [
            'cart' => $cart,
            'checkout' => $checkout,
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

        $cart = $this->getOrCreateCart($request);

        // Check if the item (by SKU and unit) already exists in the cart
        $cartItem = $cart->items()->where('sku', $validated['sku'])->where('unit', $validated['unit'])->first();

        if ($cartItem) {
            // Item exists, update quantity
            $cartItem->quantity += $validated['quantity'];

            $cartItem->save();
        } else {
            // Item does not exist, create a new one
            $cart->items()->create($validated);
        }

        $cart->recalculateTotal();

        $message = sprintf('Successfully added %d x %s to your cart.', $validated['quantity'], $validated['title']);

        // return response()->json(['message' => $message]);
        // Redirect back with a success message
        return redirect()->back()->with('success', $message);
    }

    /**
     * Get the active cart for the current user or session, or create a new one.
     *
     * @param \Illuminate\Http\Request $request
     * @return \App\Models\Cart
     */
    private function getOrCreateCart(Request $request): Cart
    {
        $user = Auth::user();
        $sessionId = $request->session()->getId();

        if ($user) {
            // Find or create a cart for the logged-in user.
            $userCart = Cart::firstOrCreate(
                ['user_id' => $user->id, 'status' => 'active'],
                ['cart_uuid' => Str::uuid(), 'session_id' => $sessionId]
            );

            // Check for a guest cart from the current session to merge.
            $sessionCart = Cart::where('session_id', $sessionId)->whereNull('user_id')->first();
            if ($sessionCart) {
                // Merge items from guest cart to user cart and delete guest cart
                $sessionCart->items()->update(['cart_id' => $userCart->id]);
                $userCart->total += $sessionCart->total;
                $userCart->save();
                $sessionCart->delete();
            }

            // Ensure session_id is always associated with the user's cart
            if ($userCart->session_id !== $sessionId) {
                $userCart->session_id = $sessionId;
                $userCart->save();
            }

            return $userCart;
        }

        // For guest users, find or create a cart based on the session ID.
        return Cart::firstOrCreate(
            ['session_id' => $sessionId, 'status' => 'active', 'user_id' => null],
            ['cart_uuid' => Str::uuid()]
        );
    }
}
