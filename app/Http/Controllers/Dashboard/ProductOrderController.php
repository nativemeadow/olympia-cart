<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductOrderController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {

        // display log message with the request data
        // logger()->info('Received request to update product order', [
        //     'request_data' => $request->all(),
        // ]);

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

        return json_encode([
            'message' => 'Product order updated successfully.',
        ]);
    }
}
