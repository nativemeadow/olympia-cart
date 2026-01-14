<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Response as InertiaResponse;
use Inertia\Inertia;

class CustomerController extends Controller
{
    //
    public function show(Request $request): InertiaResponse
    {
        $user = $request->user();
        $customer = $user->customer;

        return Inertia::render('customer/show', [
            'customer' => $customer,
        ]);
    }
}
