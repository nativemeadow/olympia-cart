<?php

namespace App\Http\Controllers\Traits;

use App\Models\Customer;
use Illuminate\Support\Facades\Auth;

trait ManagesCustomer
{
    /**
     * Get the current customer, whether they are a logged-in user or a guest.
     *
     * This is the central method for interacting with customer data throughout
     * the e-commerce process.
     *
     * @return \App\Models\Customer|null
     */
    protected function getCurrentCustomer(): ?Customer
    {
        // Priority 1: If a user is authenticated, their associated customer record is the source of truth.
        if (Auth::check()) {
            /** @var \App\Models\User $user */
            $user = Auth::user();

            // If the user doesn't have a customer record yet, create one on the fly.
            // This handles the case of a registered user making their first commerce-related action.
            // The 'firstOrCreate' method is atomic and safe.
            return $user->customer()->firstOrCreate(
                ['user_id' => $user->id],
                [
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'active' => true
                ]
            );
        }

        // Priority 2: If it's a guest, check the session for the ID we stored during checkout.
        if ($customerId = session('guest_customer_id')) {
            return Customer::find($customerId);
        }

        // If we have neither a logged-in user nor a guest ID in the session, there is no current customer.
        return null;
    }
}
