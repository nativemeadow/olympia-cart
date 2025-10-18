<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CartItemController extends Controller
{
    use AuthorizesRequests;
    /**
     * Update the specified cart item in storage.
     */
    public function update(Request $request, CartItem $cartItem)
    {
        $this->authorize('update', $cartItem);

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $cartItem->update($validated);

        // Recalculate the total from all items to ensure accuracy
        $cartItem->cart->recalculateTotal();

        return Redirect::back()->with('success', 'Cart updated successfully.');
    }

    /**
     * Remove the specified cart item from storage.
     */
    public function destroy(CartItem $cartItem)
    {
        $this->authorize('delete', $cartItem);

        $cart = $cartItem->cart;

        $cartItem->delete();

        // After deleting, check if the cart has any items left.
        if ($cart->items()->count() === 0) {
            $cart->delete();
            return Redirect::back()->with('success', 'Cart has been cleared.');
        }

        // If items remain, just recalculate the total.
        $cart->recalculateTotal();

        return Redirect::back()->with('success', 'Item removed from cart.');
    }
}
