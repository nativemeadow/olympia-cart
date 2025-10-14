<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PriceController extends Controller
{

    function index($product_id = null)
    {
        if (!$product_id) {
            return response()->json(['error' => 'Product ID is required'], 400);
        }
        $prices = \App\Models\Price::where('product_id', $product_id)->get();
        return response()->json($prices);
    }
}
