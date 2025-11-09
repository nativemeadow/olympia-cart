<?php

namespace App\Policies;

use App\Models\Checkout;
use App\Models\User;
use Illuminate\Http\Request;

class CheckoutPolicy
{
    /**
     * Determine whether the user can update the model.
     */

    public function update(?User $user, Checkout $checkout): bool
    {
        // Deny if there's no cart associated with the checkout.
        if (!$checkout->cart) {
            return false;
        }

        // If the user is authenticated, check if the cart belongs to them.
        if ($user) {
            return $checkout->cart->user_id === $user->id;
        }

        // For guests, check if the cart's session ID matches the current session.
        return $checkout->cart->session_id === session()->getId();
    }
}
