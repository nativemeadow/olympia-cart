<?php

namespace App\Listeners;

use App\Models\Cart;
use Illuminate\Auth\Events\Login;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Http\Request;

class MergeGuestCart
{
    /**
     * The request instance.
     *
     * @var \Illuminate\Http\Request
     */
    public $request;

    /**
     * Create the event listener.
     *
     * @param \Illuminate\Http\Request $request
     */
    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    /**
     * Handle the event.
     *
     * @param  \Illuminate\Auth\Events\Login  $event
     * @return void
     */
    public function handle(Login $event)
    {
        // The session has been regenerated, but the cookie for the old session ID might still be in the request.
        // However, a more reliable method is to handle this before session regeneration.
        // Since the logic was moved from the controller, let's assume the session ID in the request is the new one.
        // The old logic was flawed. Let's fix it here.
        // We can't reliably get the old session ID after the Login event.
        // The logic should be in the controller before `regenerate()`.
        // But to keep it in the listener as intended, we need to adjust the login flow slightly.

        // The provided code has logic in both AuthenticatedSessionController and this listener.
        // Let's consolidate it here, assuming the controller logic is removed.

        $user = $event->user;
        $newSessionId = $this->request->session()->getId();
        $oldSessionId = $this->request->session()->pull('old_session_id');

        // Find a cart for the guest session, if one exists.
        $guestCart = $oldSessionId ? Cart::with('items')->where('session_id', $oldSessionId)->first() : null;

        // Find or create a cart for the logged-in user.
        $userCart = Cart::with('items')->firstOrCreate(['user_id' => $user->id, 'status' => 'active']);

        // If a guest cart exists and it's different from the user's cart, merge them.
        if ($guestCart && $guestCart->id !== $userCart->id) {
            foreach ($guestCart->items as $guestItem) {
                $userItem = $userCart->items()->where('sku', $guestItem->sku)->where('unit', $guestItem->unit)->first();

                if ($userItem) {
                    $userItem->quantity += $guestItem->quantity;
                    $userItem->save();
                } else {
                    // Re-associate the guest item with the user's cart.
                    $guestItem->cart_id = $userCart->id;
                    $guestItem->save();
                }
            }
            // The guest cart has been merged, so we can delete it.
            $guestCart->delete();
        }

        // Associate the user's cart with the current session and recalculate totals.
        $userCart->update(['session_id' => $newSessionId]);
        $userCart->recalculateTotal();
    }
}
