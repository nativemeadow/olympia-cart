<?php

namespace App\Policies;

use App\Models\Checkout;
use App\Models\User;
use App\Http\Controllers\Traits\ManagesCustomer;
use Illuminate\Http\Request;

class CheckoutPolicy
{
    /**
     * Determine whether the user can update the model.
     */

    use ManagesCustomer;

    public function update(?User $user, Checkout $checkout): bool
    {
        $customer = $this->getCurrentCustomer();

        // deny if no associated cart
        if (!$checkout->cart) {
            return false;
        }

        // For a logged-in user, check if their customer ID matches the checkout's customer ID.
        if ($user && $user->customer) {
            return $user->customer->id === $checkout->customer_id;
        }

        $guestCustomerId = session()->get('guest_customer_id');

        if ($customer) {
            if ($guestCustomerId) {
                return $customer->id === $guestCustomerId;
            }
        }

        // For a guest, check if the guest_customer_id from the session matches the checkout's customer ID.
        if ($guestCustomerId) {
            return $guestCustomerId === $checkout->customer_id;
        }

        // If neither a logged-in user nor a guest session matches, deny access.
        return false;
    }
}
