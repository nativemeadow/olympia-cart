<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CategoryOrderController extends Controller
{
    public function __invoke(Request $request)
    {
        // logger()->info('Received category order update request', [
        //     'request_data' => $request->all(),
        // ]);

        $request->validate([
            'parent_id' => 'nullable|integer',
            'categories' => 'required|array',
            'categories.*.child_id' => 'required|integer|exists:categories,id',
            'categories.*.order' => 'required|integer',
        ]);

        $categories = $request->input('categories');
        $parentId = $request->input('parent_id');

        DB::transaction(function () use ($categories, $parentId) {
            foreach ($categories as $category) {
                $query = DB::table('category_category')->where(
                    'child_id',
                    (int) $category['child_id'],
                );

                if (is_null($parentId)) {
                    $query->whereNull('parent_id');
                } else {
                    $query->where('parent_id', $parentId);
                }

                $query->update(['order' => $category['order']]);
            }
        });

        // logger()->info('Category order update request processed successfully', [
        //     'parent_id' => $parentId,
        //     'categories' => $categories,
        // ]);

        return redirect()
            ->back()
            ->with('success', 'Category order updated successfully.');
    }
}
