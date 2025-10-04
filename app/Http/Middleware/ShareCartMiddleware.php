<?php

namespace App\Http\Middleware;

use App\Models\Cart;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
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

        if ($user) {
            $cart = Cart::with('items')->where('user_id', $user->id)->first();
        } else {
            $cart = Cart::with('items')->where('session_id', session()->getId())->first();
        }

        Inertia::share('cart', $cart);

        return $next($request);
    }
}
