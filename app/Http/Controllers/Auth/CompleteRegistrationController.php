<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class CompleteRegistrationController extends Controller
{
    /**
     * Display the registration completion view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/guest-complete-reg', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming registration completion request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {

        $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = Auth::user();
        //type hint the $user variable
        /** @var \App\Models\User $user */

        $user->forceFill([
            'password' => Hash::make($request->password),
        ])->save();

        // On success, redirect the user to the homepage.
        return redirect('/');
    }
}
