<?php

namespace App\Http\Controllers\Auth;

use App\Models\Cart;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Handle an incoming registration request during checkout.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function checkoutStore(Request $request): JsonResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Capture the guest session ID before it's regenerated on login.
        $guestSessionId = $request->session()->getId();

        event(new Registered($user));

        Auth::login($user);

        // Now, use the old guest session ID to find and merge the cart.
        $this->mergeGuestCart($guestSessionId, $user);


        return response()->json(['message' => 'Registration successful.']);
    }

    /**
     * Merge a guest cart with a user's cart.
     *
     * @param string|null $oldSessionId
     * @param \App\Models\User $user
     */
    private function mergeGuestCart(?string $oldSessionId, User $user): void
    {
        if (!$oldSessionId) {
            return;
        }

        $guestCart = Cart::where('session_id', $oldSessionId)->whereNull('user_id')->first();

        if (!$guestCart) {
            return;
        }

        // Since this is a new user, they won't have a cart. We can just assign the guest cart to them.
        $guestCart->user_id = $user->id;
        $guestCart->session_id = session()->getId(); // Update to the new session ID
        $guestCart->save();
    }
}
