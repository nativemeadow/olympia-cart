<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Customer;

class CustomersController extends Controller
{
    //
    function getAll(Request $request)
    {
        // get all customers and return to the view
        // plus the customers carts and orders and order-items and products
        // also include cart items and products for each cart
        $customers = Customer::with(['carts', 'carts.items', 'carts.items.product', 'orders', 'orders.items', 'orders.items.product'])->get();
        //log::info('Customers with carts and orders: ' . $customers->toJson());
        return inertia('dashboard/customers/index', ['customers' => $customers]);
    }
}
