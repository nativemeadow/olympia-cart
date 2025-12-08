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
        $user = $event->user;
        $newSessionId = $this->request->session()->getId();

        // The 'old_session_id' should be stored in the session before it's regenerated during login.
        $oldSessionId = $this->request->session()->pull('old_session_id');

        // Find the guest cart from before the login.
        $guestCart = $oldSessionId ? Cart::with('items')->where('session_id', $oldSessionId)->where('status', 'active')->first() : null;

        // Find the user's existing cart, if any.
        $userCart = Cart::with('items')->where('user_id', $user->id)->where('status', 'active')->where('status', 'active')->first();

        if ($guestCart) {
            if ($userCart) {
                // Both a guest cart and a user cart exist. Merge guest items into the user's cart.
                $guestCart->items()->update(['cart_id' => $userCart->id]);
                $userCart->recalculateTotal();
                $guestCart->delete();
            } else {
                // Only a guest cart exists. Assign it to the user.
                $guestCart->user_id = $user->id;
                $userCart = $guestCart; // The guest cart is now the user's cart.
            }
        }

        // Ensure the user's cart (either existing or newly assigned) is associated with the new session.
        if ($userCart) {
            $userCart->session_id = $newSessionId;
            $userCart->save();
        }
    }
}
