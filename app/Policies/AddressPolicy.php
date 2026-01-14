<?php

namespace App\Policies;

use App\Models\Address;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AddressPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->customer()->exists(); // Or add specific logic if needed
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Address $address): bool
    {
        return $user->customer()->exists() && $user->customer->id === $address->customer_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // All authenticated users can create addresses
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Address $address): bool
    {
        // A user can update an address if they are the owner of that address.
        // 1. Get the user's associated customer ID.
        $customer_id = $user->customer?->id;

        // 2. Check if the address's customer_id matches.
        return $customer_id === $address->customer_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Address $address): bool
    {
        // A user can delete an address if it belongs to their customer profile.
        return $user->customer?->id === $address->customer_id;
    }
}
