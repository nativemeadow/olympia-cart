<?php

namespace App\Http\Middleware;

use App\Models\Cart;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Traits\ManagesCustomer;

use Symfony\Component\HttpFoundation\Response;

class ShareCartMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        $cart = null;

        $customer = $user?->customer;

        if (!$customer) {
            // If there's no authenticated user or customer, check for a guest customer in the session.
            $guestCustomerId = session()->get('guest_customer_id');
            if ($guestCustomerId) {
                $customer = \App\Models\Customer::find($guestCustomerId);
            }
        }

        if ($customer) {
            // If a user is logged in AND has a customer record, find their cart.
            $cart = Cart::with('items')->where('customer_id', $customer->id)->where('status', 'active')->first();
        } else {
            // For guests or users without a customer record, find the cart by session ID.
            $cart = Cart::with('items')->where('session_id', session()->getId())->where('status', 'active')->first();
        }

        Inertia::share('cart', $cart);

        return $next($request);
    }
}
