<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Get all top-level categories (categories with no parents).
     */
    public function topLevelCategories()
    {
        $topLevelCategories = \App\Models\Category::whereDoesntHave('parents')->get();
        return response()->json($topLevelCategories);
    }

    public function children($id)
    {
        $children = \App\Models\Category::where('parent_id', $id)->get();
        return response()->json($children);
    }

    public function parents($id)
    {
        $parents = \App\Models\Category::where('child_id', $id)->get();
        return response()->json($parents);
    }
}
