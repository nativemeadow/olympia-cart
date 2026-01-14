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

        // Capture the guest session ID before it's regenerated on login.
        $guestSessionId = $request->session()->getId();

        $request->session()->put('old_session_id', $request->session()->getId());

        $request->authenticate();

        $request->session()->regenerate();

        // Merge the guest cart from before login.
        // Now, use the old guest session ID to find and merge the cart.
        $this->mergeGuestCart($guestSessionId, $request->user());

        // Merge any other past active carts belonging to this user.
        $this->mergePastUserCarts();

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

        $customer = $user->customer;

        // Eager load items to prevent N+1 queries
        $guestCart = Cart::with('items.product')->where('session_id', $oldSessionId)->whereNull('customer_id')->where('status', 'active')->first();

        if (! $guestCart) {
            return;
        }

        $userCart = Cart::firstOrCreate(
            ['customer_id' => $customer->id, 'status' => 'active'],
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

        // If the guest cart had checkout data, associate it with the final cart.
        if ($guestCart->checkout) {
            $guestCheckout = $guestCart->checkout;
            $guestCheckout->cart_id = $userCart->id;
            $guestCheckout->save();
        }

        $userCart->recalculateTotal();
        $guestCart->delete();
    }

    /**
     * Merges items from a user's previous active carts into their current active cart.
     * This is called after a user logs in to consolidate carts from different sessions/devices.
     *
     * @return void
     */
    private function mergePastUserCarts(): void
    {
        $user = Auth::user();
        if (! $user) {
            return;
        }

        $customer = $user->customer;

        // Find all active carts for this user, with the most recently updated one first.
        $allCarts = Cart::with('items.product')
            ->where('customer_id', $customer->id)
            ->where('status', 'active')
            ->orderBy('updated_at', 'desc')
            ->get();

        $count = $allCarts->count();

        // If there's only one or zero carts, there's nothing to merge.
        if ($count <= 1) {
            return;
        }

        // The first cart in the collection is our primary cart.
        $primaryCart = $allCarts->shift();
        $primaryCart->session_id = session()->getId();
        $primaryCart->save();
        $primaryCart->load('items'); // Ensure items are loaded for the loop.

        // The rest of the carts in the collection are the old ones to be merged.
        foreach ($allCarts as $oldCart) {
            foreach ($oldCart->items as $itemToMerge) {
                // Check if the same product already exists in the primary cart.
                $existingItem = $primaryCart->items->firstWhere('product_id', $itemToMerge->product_id);

                if ($existingItem) {
                    // If it exists, update the quantity and delete the old item.
                    $existingItem->quantity += $itemToMerge->quantity;
                    $existingItem->save();
                    $itemToMerge->delete();
                } else {
                    // If it doesn't exist, re-associate the item with the primary cart.
                    $itemToMerge->cart()->associate($primaryCart)->save();
                }
            }
            // After merging all items, delete the old, now-empty cart.
            $oldCart->delete();
        }

        // Recalculate the total for the primary cart since items have been added.
        $primaryCart->recalculateTotal();
    }
}
