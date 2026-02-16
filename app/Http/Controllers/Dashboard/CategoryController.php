<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // This is handled by the DashboardController, which is fine.
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|unique:categories,title',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        Category::create($validated);

        return Redirect::route('dashboard.categories.index')->with(
            'success',
            'Category created.',
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories')->ignore($category->id),
            ],
            'parent_id' => [
                'nullable',
                'exists:categories,id',
                Rule::notIn([$category->id]), // Cannot be its own parent
            ],
        ]);

        $category->update($validated);

        return Redirect::route('dashboard.categories.index')->with(
            'success',
            'Category updated.',
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Before deleting, assign the children of the deleted category to its parent.
        // This prevents orphaning the child categories.
        $category
            ->children()
            ->update(['parent_id' => $category->parent_id]);

        $category->delete();

        return Redirect::route('dashboard.categories.index')->with(
            'success',
            'Category deleted.',
        );
    }
}
