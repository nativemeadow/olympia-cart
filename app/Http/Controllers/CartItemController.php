<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class CartItemController extends Controller
{
    /**
     * Update the specified cart item in storage.
     */
    public function update(Request $request, CartItem $cartItem)
    {
        // Ensure the item belongs to the current user's cart
        $cart = Cart::getFromSession();
        if (!$cart || $cartItem->cart_id !== $cart->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $cartItem->update($validated);

        // Recalculate the total from all items to ensure accuracy
        $cart->recalculateTotal();

        return Redirect::back()->with('success', 'Cart updated successfully.');
    }

    /**
     * Remove the specified cart item from storage.
     */
    public function destroy(CartItem $cartItem)
    {
        // Ensure the item belongs to the current user's cart
        $cart = Cart::getFromSession();
        if (!$cart || $cartItem->cart_id !== $cart->id) {
            abort(403, 'Unauthorized action.');
        }

        $cartItem->delete();

        // Recalculate the total from all items to ensure accuracy
        $cart->recalculateTotal();

        return Redirect::back()->with('success', 'Item removed from cart.');
    }
}
