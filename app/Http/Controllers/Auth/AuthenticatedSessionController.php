<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Find guest cart before authentication and session regeneration
        $guestCart = Cart::where('session_id', $request->session()->getId())->first();

        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();

        if ($user && $guestCart) {
            $userCart = Cart::where('user_id', $user->id)->first();

            if ($userCart) {
                // Merge guest cart items into user's existing cart
                foreach ($guestCart->items as $guestItem) {
                    $existingItem = $userCart->items()->where('sku', $guestItem->sku)->where('unit', $guestItem->unit)->first();
                    if ($existingItem) {
                        $existingItem->quantity += $guestItem->quantity;
                        $existingItem->save();
                    } else {
                        $guestItem->cart_id = $userCart->id;
                        $guestItem->save();
                    }
                }
                $guestCart->delete();
            } else {
                // No user cart, so assign the guest cart to the user
                $guestCart->update(['user_id' => $user->id, 'session_id' => null]);
            }
        }

        return redirect()->intended(route('home', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
