<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

use App\Models\Product;

use Illuminate\Http\Request;

class ProductController extends Controller
{
    //

    public function show($categorySlug, $slug)
    {
        $product = Product::where('slug', $slug)->with('prices')->firstOrFail();

        return Inertia::render('categories/products/show', [
            'categorySlug' => $categorySlug,
            'product' => $product,
        ]);
    }
}
