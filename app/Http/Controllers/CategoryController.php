<?php

namespace App\Http\Controllers;

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
            'categories' => $categories,
        ]);
    }

    public function show($categorySlug): Response
    {
        $category = Category::where('slug', $categorySlug)
            ->with(['children', 'products.prices'])
            ->firstOrFail();

        return Inertia::render('categories/show', [
            'category' => $category,
            'category_path' => $categorySlug,
        ]);
    }
}
