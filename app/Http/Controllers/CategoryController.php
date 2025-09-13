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
        $children = Category::find($id)->children;
        return response()->json($children);
    }

    public function parents($id)
    {
        $parents = Category::where('child_id', $id)->get();
        return response()->json($parents);
    }


    public function index(): Response
    {
        $categories = Category::whereIn('id', function ($query) {
            $query->select('child_id')
                ->from('category_category')
                ->whereNull('parent_id');
        })->get();
        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    public function show($categorySlug): Response
    {
        $category = Category::where('slug', $categorySlug)
            ->firstOrFail();
        // Load children for the category to display subcategories
        $category->load('children');

        return Inertia::render('categories/show', [
            'category' => $category,
            'category_path' => $categorySlug,
        ]);
    }
}
