<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductOrderController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $request->validate([
            'category_id' => 'required|integer|exists:categories,id',
            'products' => 'required|array',
            'products.*.product_id' => 'required|integer|exists:products,id',
            'products.*.product_order' => 'required|integer',
        ]);

        $categoryId = $request->input('category_id');
        $products = $request->input('products');

        DB::transaction(function () use ($categoryId, $products) {
            foreach ($products as $product) {
                DB::table('category_product')
                    ->where('category_id', $categoryId)
                    ->where('product_id', $product['product_id'])
                    ->update(['product_order' => $product['product_order']]);
            }
        });

        return redirect()->back()->with('success', 'Product order updated successfully.');
    }
}
