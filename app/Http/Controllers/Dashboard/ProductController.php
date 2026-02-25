<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\Product;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    //
    public function show($product_id)
    {
        // get the product with its categories and variants and variants associated with the product
        $product = Product::with([
            'categories',
            'variants' => function ($query) {
                $query->with('attributeValues.attribute');
            },
        ])->find($product_id);

        if (!$product) {
            return response()->json(['product' => null], 404);
        }

        $productArray = $product->toArray();

        if (isset($productArray['variants'])) {
            $productArray['prices'] = $productArray['variants'];
            unset($productArray['variants']);

            // Unset the now-redundant attribute_values from each price
            foreach ($productArray['prices'] as &$price) {
                unset($price['attribute_values']);
            }
        }

        return response()->json([
            'product' => $productArray,
        ]);
    }

    public function store(Request $request)
    {
        // This is handled by the DashboardController, which is fine.
    }

    public function update(Request $request, $id)
    {
        // This is handled by the DashboardController, which is fine.
    }

    public function destroy($id)
    {
        // This is handled by the DashboardController, which is fine.
    }
}
