<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryShowResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function children($id)
    {
        $children = Category::findOrFail($id)->children;
        return response()->json($children);
    }

    public function parents($id)
    {
        $parents = Category::findOrFail($id)->parents;
        return response()->json($parents);
    }


    public function index(): Response
    {
        // A top-level category is one that does not have any parents.
        // Using doesntHave() is more expressive and robust than the previous subquery.
        $categories = Category::doesntHave('parents')->get();

        return Inertia::render('categories/index', [
            'categories' => $categories
        ]);
    }

    public function show($categorySlug): Response
    {
        // THE FIX: Update the eager loading to fetch the new relationships.
        // We load products, then for each product its variants,
        // and for each variant its attributeValues and the parent attribute.
        $category = Category::where('slug', $categorySlug)
            ->with([
                'children',
                'products.variants.attributeValues.attribute'
            ])
            ->firstOrFail();

        $categoryData = new CategoryShowResource($category);

        error_log('Category Data: ' . print_r($categoryData->toArray(request()), true));

        return Inertia::render('categories/show', [
            // Wrap the category model in our new resource before sending it to the view.
            'categoryData' => $categoryData,
            'category_path' => $categorySlug,
        ]);
    }
}
