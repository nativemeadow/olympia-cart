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
        $customers = Customer::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('dashboard/orders/index', [
            'customers' => $customers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function getCustomerOrders(Customer $customer)
    {
        $orders = $customer
            ->orders()
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($orders);
    }

    public function getOrderDetails(Order $order)
    {
        $order->load(['items', 'checkout.payment']);
        return response()->json($order);
    }
}
