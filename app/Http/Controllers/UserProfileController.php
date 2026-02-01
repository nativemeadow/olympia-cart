<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Inertia\Response as InertiaResponse;

class UserProfileController extends Controller
{
    public function show(Request $request): InertiaResponse
    {
        $user = $request->user();
        $customer = $user->customer;

        return Inertia::render('user-profile/show', [
            //'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'address' => $customer ? $customer->addresses : null,
            'status' => session('status'),
            'orders' => $customer->orders()->with('items')->latest()->get(),
        ]);
    }
}
