<?php

namespace App\Policies;

use App\Models\CartItem;
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Session;
use Pest\ArchPresets\Custom;

class CartItemPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, CartItem $cartItem): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(?User $user, CartItem $cartItem): bool
    {
        // If a user is authenticated, check ownership via the customer record.
        if ($user && $user->customer) {
            return $cartItem->cart->customer_id === $user->customer->id;
        }

        // If it's a guest, check if the cart's session_id matches the current session.
        if (is_null($user)) {
            return $cartItem->cart->session_id === Session::getId();
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(?User $user, CartItem $cartItem): bool
    {
        // If a user is authenticated, check ownership via the customer record.
        if ($user && $user->customer) {
            return $cartItem->cart->customer_id === $user->customer->id;
        }

        // If it's a guest, check if the cart's session_id matches the current session.
        if (is_null($user)) {
            return $cartItem->cart->session_id === Session::getId();
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(?User $user, CartItem $cartItem): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, CartItem $cartItem): bool
    {
        return false;
    }
}
