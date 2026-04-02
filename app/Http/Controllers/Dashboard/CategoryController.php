<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
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
    public function store(Request $request, $parentId = null)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255|unique:categories,title',
            'slug' => 'required|string|max:255|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            'ancestorSlug' => 'nullable|string',
            'description' => 'required|string',
            'image' => 'required|string|max:255',
            'is_active' => 'nullable|boolean',
            'parent_id' => 'nullable|exists:categories,id',
        ], [
            'title.required' => 'The category title is required.',
            'title.max' => 'The category title must not exceed 255 characters.',
            'title.unique' => 'A category with this title already exists.',
            // slug must not contain spaces. It must be alphanumeric with dashes allowed but no other special characters. 
            // We can enforce this with a regex.
            'slug.required' => 'The category slug is required.',
            'slug.regex' => 'The category slug may only contain letters, numbers, and dashes, and must not contain spaces or special characters.',
            'slug.max' => 'The category slug must not exceed 255 characters.',
            'slug.unique' => 'A category with this slug already exists.',
            'description.required' => 'The category description is required',
            'image.required' => 'The category image is required.',

            'image.max' => 'The image name must not exceed 255 characters.',
            'is_active.boolean' => 'The is active field must be true or false.',
            'parent_id.exists' => 'The selected parent category does not exist.',
        ]);

        DB::beginTransaction();

        try {
            $slug = $validatedData['slug'] ?? Str::slug($validatedData['title']);
            $fullSlug = ($validatedData['ancestorSlug'] ?? '') . $slug;

            // Check for slug uniqueness manually
            if (Category::where('slug', $fullSlug)->exists()) {
                return back()->withErrors(['slug' => 'A category with this slug already exists.'])->withInput();
            }

            $category = Category::create([
                'title' => $validatedData['title'],
                'slug' => $fullSlug,
                'uuid' => Str::uuid(),
                'description' => $validatedData['description'] ?? null,
                'image' => $validatedData['image'] ?? null,
                'is_active' => $validatedData['is_active'] ?? false,
            ]);

            $parentId = $validatedData['parent_id'] ?? null;

            // Get the maximum order for the given parent (or for top-level categories if parentId is null).
            $maxOrder = DB::table('category_category')
                ->where('parent_id', $parentId)
                ->max('order');

            // If we have a parent, we attach it. This creates the pivot record.
            if ($parentId) {
                $category->parents()->attach($parentId, ['order' => $maxOrder + 1, 'slug' => $slug]);
            } else {
                // For top-level categories, we still need a pivot record to manage order.
                // We can create it directly, as there's no "parent" to attach to.
                DB::table('category_category')->insert([
                    'category_id' => $category->id,
                    'parent_id' => null,
                    'slug' => $slug,
                    'order' => $maxOrder + 1,
                ]);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return  redirect()->route('dashboard.categories.index')->with(
                'error',
                'Failed to create category: ' . $e->getMessage(),
            );
        }

        return  redirect()->route('dashboard.categories.index')->with(
            'success',
            'Category created.',
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validatedData = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories')->ignore($category->id),
            ],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            ],
            'ancestorSlug' => 'nullable|string',
            'description' => 'required|string',
            'image' => 'required|string|max:255',
            'is_active' => 'nullable|boolean',
            'parent_id' => [
                'nullable',
                'exists:categories,id',
                Rule::notIn([$category->id]), // Cannot be its own parent
            ],
        ], [
            'title.required' => 'The category title is required.',
            'title.max' => 'The category title must not exceed 255 characters.',
            'title.unique' => 'A category with this title already exists.',
            // slug must not contain spaces. It must be alphanumeric with dashes allowed but no other special characters. 
            // We can enforce this with a regex.
            'slug.required' => 'The category slug is required.',
            'slug.regex' => 'The category slug may only contain letters, numbers, and dashes, and must not contain spaces or special characters.',
            'slug.max' => 'The category slug must not exceed 255 characters.',
            'slug.unique' => 'A category with this slug already exists.',
            'description.required' => 'The category description is required.',
            'image.required' => 'The category image is required.',

            'image.max' => 'The image name must not exceed 255 characters.',
            'is_active.boolean' => 'The is active field must be true or false.',
            'parent_id.exists' => 'The selected parent category does not exist.',
            'parent_id.not_in' => 'A category cannot be its own parent.',
        ]);

        DB::beginTransaction();

        try {
            $slug = $validatedData['slug'] ?? Str::slug($validatedData['title']);
            $fullSlug = ($validatedData['ancestorSlug'] ?? '') . $slug;

            // Check for slug uniqueness manually
            if (Category::where('slug', $fullSlug)->where('id', '!=', $category->id)->exists()) {
                return back()->withErrors(['slug' => 'A category with this slug already exists.'])->withInput();
            }

            $category->update([
                'title' => $validatedData['title'],
                'slug' => $slug, //$fullSlug,
                'description' => $validatedData['description'] ?? null,
                'image' => $validatedData['image'] ?? null,
                'is_active' => $validatedData['is_active'] ?? false,
            ]);

            // If a parent_id is provided, add it to the category's set of parents
            // without removing existing ones.
            $parentId = $validatedData['parent_id'] ?? null;
            if ($parentId) {
                $category->parents()->syncWithoutDetaching($parentId);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return  redirect()->route('dashboard.categories.index')->with(
                'error',
                'Failed to update category: ' . $e->getMessage(),
            );
        }

        return  redirect()->route('dashboard.categories.index')->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Check if the category has any products associated with it.
        if ($category->products()->exists()) {
            return  redirect()->route('dashboard.categories.index')->with(
                'error',
                'Cannot delete category. It is associated with products.',
            );
        }

        // Check if the category has any children.
        if ($category->children()->exists()) {
            return  redirect()->route('dashboard.categories.index')->with(
                'error',
                'Cannot delete category. It has child categories.',
            );
        }

        $category->delete();

        return  redirect()->route('dashboard.categories.index')->with(
            'success',
            'Category deleted.',
        );
    }

    public function categoryMedia(Request $request)
    {
        $sort = $request->query('sort_column', 'created_at');
        $order = $request->query('order', 'desc');
        $perPage = $request->query('per_page', 10);
        $searchTerm = $request->query('search_term', '');

        $media = Media::query()
            ->where('type', 'categories')
            ->when($searchTerm, function ($query, $searchTerm) {
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('title', 'like', "%{$searchTerm}%")
                        ->orWhere('alt_text', 'like', "%{$searchTerm}%");
                });
            })
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->withQueryString();

        // Transform the collection to add the full URL
        $media->through(function ($item) {
            // Use the asset() helper to generate the full, correct URL.
            $item->url = asset($item->file_path);
            return $item;
        });

        // return a json response with the media and the pagination data
        return response()->json([
            'media' => [
                'data' => $media->items(),
                'links' => $media->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $media->currentPage(),
                    'from' => $media->firstItem(),
                    'to' => $media->lastItem(),
                    'total' => $media->total(),
                    'path' => $media->path(),
                    'per_page' => $media->perPage(),
                    'last_page' => $media->lastPage(),
                ],
            ],
            'filters' => $request->only(['sort_column', 'order', 'per_page', 'search_term']),
        ]);
    }
}
