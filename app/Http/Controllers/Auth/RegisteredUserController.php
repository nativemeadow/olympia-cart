<?php

namespace App\Http\Controllers\Auth;

use App\Mail\LoginCodeMail;
use App\Models\Cart;
use App\Http\Controllers\Controller;
use App\Models\LoginCode;
use App\Models\User;
use App\Models\Customer;
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
     * Creates a customer record without a user.
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

        if ($existingUser) {
            // A user with this email already exists, so they should log in.
            return response()->json([
                'errors' => ['email' => ['An account with this email already exists. Please log in.']],
            ], 422);
        }

        // Find or create a customer record.
        $customer = Customer::firstOrCreate(
            ['email' => $request->email],
            [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
            ]
        );

        // Store customer ID in session to identify as guest.
        $request->session()->put('guest_customer_id', $customer->id);

        // Associate the cart with the customer.
        $cart = Cart::where('session_id', $request->session()->getId())->first();
        if ($cart) {
            $cart->customer_id = $customer->id;
            $cart->save();
        }

        return response()->json(['message' => 'Proceeding as guest.']);
    }

    /**
     * Handle an incoming authentication request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'errors' => ['email' => ['The provided credentials do not match our records.']],
            ], 422);
        }

        Auth::login($user);

        return response()->json(['message' => 'Login successful.']);
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

        // Temporary debugging
        Log::info('Attempting to send login code email to ' . $email);
        Log::info('Mail driver: ' . config('mail.default'));
        Log::info('Mail host: ' . config('mail.mailers.smtp.host'));
        Log::info('Mail port: ' . config('mail.mailers.smtp.port'));

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

        $guestCart = Cart::where('session_id', $oldSessionId)->whereNull('customer_id')->first();

        if (!$guestCart) {
            return;
        }

        // Find or create a customer record for the user, only when they are checking out.
        $customer = Customer::firstOrCreate(
            ['user_id' => $user->id],
            [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
            ]
        );

        // Check if the user already has an active cart.
        $userCart = Cart::with('items')->where('customer_id', $customer->id)->where('status', 'active')->first();

        if ($userCart) {
            // User has an existing cart, merge guest items into it.
            foreach ($guestCart->items as $guestItem) {
                // Check if an item with the same SKU and unit already exists in the user's cart.
                $existingItem = $userCart->items->firstWhere(fn($item) => $item->sku === $guestItem->sku && $item->unit === $guestItem->unit);

                if ($existingItem) {
                    $existingItem->quantity += $guestItem->quantity;
                    $existingItem->save();
                } else {
                    $guestItem->cart_id = $userCart->id;
                    $guestItem->save();
                }
            }
            $userCart->recalculateTotal();
            $guestCart->delete(); // Delete the old guest cart
        } else {
            // No existing user cart, so we can just assign the guest cart to the user.
            $guestCart->customer_id = $customer->id;
            $guestCart->session_id = session()->getId(); // Update to the new session ID
            $guestCart->save();
        }
    }
}
