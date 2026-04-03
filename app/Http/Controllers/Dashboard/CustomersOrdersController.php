<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use \App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomersOrdersController extends Controller
{
    public function index(Request $request)
    {
        $customers = Customer::with(['orders' => function ($query) {
            $query->with('items')->orderBy('created_at', 'desc');
        }])
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->paginate(10);

        return Inertia::render('dashboard/orders/index', [
            'customers' => $customers,
        ]);
    }
}
