<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Get all top-level categories (categories with no parents).
     */
    public function topLevelCategories()
    {
        $topLevelCategories = Category::whereDoesntHave('parents')->get();
        return response()->json($topLevelCategories);
    }

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
        $categories = Category::whereDoesntHave('parents')->get();
        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    public function show($slug): Response
    {
        $slugs = explode('/', $slug);
        $category = null;

        // Find the first category in the path. It must be a top-level category.
        $firstSlug = array_shift($slugs);
        $category = Category::where('slug', $firstSlug)
            ->whereDoesntHave('parents')
            ->first();

        // If the first category in the path doesn't exist or isn't a top-level category, 404.
        if (!$category) {
            abort(404);
        }

        // Now, traverse the rest of the path.
        foreach ($slugs as $childSlug) {
            // Find the child of the *current* category that matches the next slug.
            $category = $category->children()->where('slug', $childSlug)->first();
            //var_dump($category);

            // If at any point a child is not found, the path is invalid.
            if (!$category) {
                abort(404);
            }
        }

        // If we've successfully traversed the whole path, load the final category's children for display.
        $category->load('children');

        return Inertia::render('categories/show', [
            'category' => $category,
            'category_path' => $slug,
        ]);
    }
}
