<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Http\Resources\ProductResource;

use App\Models\Product;

use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index($product_id = null)
    {
        $products = Product::where('id', $product_id)->with('prices')->get();
        return response()->json($products);
    }

    // public function show($categorySlug, $slug)
    // {
    //     $product = Product::where('slug', $slug)->with('prices')->firstOrFail();

    //     return Inertia::render('categories/products/show', [
    //         'categorySlug' => $categorySlug,
    //         'product' => $product,
    //     ]);
    // }

    public function show($categorySlug, $slug)
    {
        $product = Product::where('slug', $slug)
            ->with([
                'variants.attributeValues.attribute'
            ])
            ->firstOrFail();

        $productData = new ProductResource($product);

        return Inertia::render('categories/products/show', [
            'categorySlug' => $categorySlug,
            'productData' => $productData,
        ]);
    }
}
