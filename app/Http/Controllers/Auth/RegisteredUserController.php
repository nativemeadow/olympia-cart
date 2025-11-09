<?php

namespace App\Http\Controllers\Auth;

use App\Mail\LoginCodeMail;
use App\Models\Cart;
use App\Http\Controllers\Controller;
use App\Models\LoginCode;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
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
    public function checkoutStore(Request $request): JsonResponse // For full account creation
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
     * Handle an incoming guest registration request during checkout.
     * Creates a user without a password.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function checkoutGuestStore(Request $request): JsonResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255',
        ]);

        $existingUser = User::where('email', $request->email)->first();

        // User exists and has a password, so they are a fully registered user.
        if ($existingUser && $existingUser->password) {
            return response()->json([
                'errors' => ['email' => ['An account with this email already exists. Please log in.']],
            ], 422);
        }

        // User exists but has no password, so they are a returning guest.
        if ($existingUser) {
            $this->sendLoginCode($existingUser->email);
            return response()->json(['status' => 'code_sent']);
        }

        // No user exists, create a new guest user.
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => null, // Store guest users without a password
        ]);

        // Capture the guest session ID before it's regenerated on login.
        $guestSessionId = $request->session()->getId();

        event(new Registered($user));

        Auth::login($user);

        $this->mergeGuestCart($guestSessionId, $user);

        return response()->json(['message' => 'Guest registration successful.']);
    }

    /**
     * Verify the login code for a returning guest.
     */
    public function verifyGuestCode(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|min:6|max:6',
        ]);

        $loginCode = LoginCode::where('email', $request->email)->first();

        if (!$loginCode || $loginCode->code !== $request->code || $loginCode->expires_at->isPast()) {
            return response()->json([
                'errors' => ['code' => ['The code is invalid or has expired.']],
            ], 422);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $guestSessionId = $request->session()->getId();

        Auth::login($user);
        $this->mergeGuestCart($guestSessionId, $user);

        $loginCode->delete();

        return response()->json(['message' => 'Login successful.']);
    }

    /**
     * Resend the login code.
     */
    public function resendGuestCode(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|exists:users,email']);
        $this->sendLoginCode($request->email);
        return response()->json(['status' => 'code_sent']);
    }

    /**
     * Generate, store, and send a login code.
     */
    private function sendLoginCode(string $email): void
    {
        $code = random_int(100000, 999999);

        LoginCode::updateOrCreate(
            ['email' => $email],
            [
                'code' => $code,
                'expires_at' => now()->addMinutes(10),
            ]
        );

        try {
            Mail::to($email)->send(new LoginCodeMail((string)$code));
        } catch (\Exception $e) {
            // It's good practice to log mail sending errors
            Log::error("Failed to send login code email: " . $e->getMessage());
            // Depending on requirements, you might want to throw an exception or handle it silently.
        }
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

        $guestCart = Cart::with('items')->where('session_id', $oldSessionId)->whereNull('user_id')->first();

        if (!$guestCart) {
            return;
        }

        // Check if the user already has an active cart.
        $userCart = Cart::with('items')->where('user_id', $user->id)->where('status', 'active')->first();

        if ($userCart) {
            // User has an existing cart, merge guest items into it.
            foreach ($guestCart->items as $guestItem) {
                // Check if an item with the same SKU and unit already exists in the user's cart.
                $existingItem = $userCart->items->firstWhere(fn($item) => $item->sku === $guestItem->sku && $item->unit === $guestItem->unit);

                if ($existingItem) {
                    $existingItem->quantity += $guestItem->quantity;
                    $existingItem->save();
                } else {
                    $guestItem->cart()->associate($userCart)->save();
                }
            }
            $userCart->recalculateTotal();
            $guestCart->delete(); // Delete the old guest cart
        } else {
            // No existing user cart, so we can just assign the guest cart to the user.
            $guestCart->user_id = $user->id;
            $guestCart->session_id = session()->getId(); // Update to the new session ID
            $guestCart->save();
        }
    }
}
