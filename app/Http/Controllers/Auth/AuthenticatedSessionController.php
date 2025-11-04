<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Cart;
use App\Models\User;
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
        $request->session()->put('old_session_id', $request->session()->getId());

        $request->authenticate();

        $request->session()->regenerate();

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

    public function checkoutLogin(LoginRequest $request)
    {
        // Capture the guest session ID before it's regenerated on login.
        $guestSessionId = $request->session()->getId();

        $request->authenticate();

        $request->session()->regenerate();

        // Now, use the old guest session ID to find and merge the cart.
        $this->mergeGuestCart($guestSessionId, $request->user());


        // For an Inertia request, a 200 OK with no body is sufficient
        // for the onSuccess callback to be triggered on the frontend.
        // The frontend will then handle the page update.
        return response()->noContent();
    }

    /**
     * Merge a guest cart with a user's cart.
     *
     * @param string|null $oldSessionId
     * @param \App\Models\User $user
     */
    private function mergeGuestCart(?string $oldSessionId, User $user): void
    {
        if (! $oldSessionId) {
            return;
        }

        // Eager load items to prevent N+1 queries
        $guestCart = Cart::with('items')->where('session_id', $oldSessionId)->whereNull('user_id')->first();

        if (! $guestCart) {
            return;
        }

        $userCart = Cart::firstOrCreate(
            ['user_id' => $user->id, 'status' => 'active'],
            ['cart_uuid' => \Illuminate\Support\Str::uuid(), 'session_id' => session()->getId()]
        );

        // Eager load user cart items as well
        $userCart->load('items');

        foreach ($guestCart->items as $guestItem) {
            // Check if an item with the same SKU and unit already exists in the user's cart.
            $existingItem = $userCart->items->firstWhere(fn($item) => $item->sku === $guestItem->sku && $item->unit === $guestItem->unit);

            if ($existingItem) {
                // If it exists, update the quantity and delete the guest item.
                $existingItem->quantity += $guestItem->quantity;
                $existingItem->save();
                $guestItem->delete();
            } else {
                // If it doesn't exist, simply associate the guest item with the user's cart.
                $guestItem->cart()->associate($userCart)->save();
            }
        }

        $userCart->recalculateTotal();
        $guestCart->delete();
    }
}
