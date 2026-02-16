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

    /**
     * Determine whether the user can assign a customer to the checkout.
     * This is a special case for when a guest becomes an authenticated user.
     */
    public function assignCustomer(?User $user, Checkout $checkout): bool
    {
        // Use the trait to get the current customer, which will be the authenticated user.
        $customer = $this->getCurrentCustomer();

        // The user must be authenticated and have a customer record to claim a checkout.
        if (!$customer) {
            return false;
        }

        // The checkout must have a cart associated with it.
        if (!$checkout->cart) {
            return false;
        }

        // The key check: The session ID of the cart must match the current session ID.
        // This proves the checkout was created in the current user's browser session.
        return $checkout->cart->session_id === session()->getId();
    }
}
