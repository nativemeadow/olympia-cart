<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Customer;

use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $customers = Customer::when($request->input('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->with([
            'carts',
            'carts.items',
            'carts.items.product',
            'orders',
            'orders.items',
            'orders.items.product'
            ])->with([
                'orders' => function ($query) {
                    $query->with('items')->orderBy('created_at', 'desc');
                },
            ])->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(10)
            ->withQueryString();

        return inertia('dashboard/customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search']),
        ]);
    }
}
