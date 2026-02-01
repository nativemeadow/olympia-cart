<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Cart;
use App\Models\Checkout;

class EnsureCheckoutIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check for a flashed session variable that grants one-time access to the confirmation page.
        if ($request->session()->has('can_view_confirmation')) {
            return $next($request);
        }

        $sessionId = $request->session()->getId();

        // For all other checkout routes, require an 'active' cart.
        $cart = Cart::where('session_id', $sessionId)->where('status', 'active')->first();

        if (!$cart) {
            return redirect()->route('shopping-cart.show');
        }

        // Now, use the cart's ID to find the checkout record.
        $checkout = Checkout::where('cart_id', $cart->id)->first();

        if (!$checkout) {
            return redirect()->route('shopping-cart.show');
        }

        return $next($request);
    }
}
