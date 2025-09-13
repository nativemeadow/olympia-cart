<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoryPGSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $json = file_get_contents(database_path('/csv/category.json'));
        $categoriesData = json_decode($json, true);


        foreach ($categoriesData as $data) {
            Category::create([
                'id' => $data['id'],
                'uuid' => $data['uuid'],
                'title' => $data['title'],
                'slug' => $data['slug'],
                'description' => $data['description'],
                'image' => $data['image'],
                'is_active' => $data['is_active'],
                'created_at' => $data['created_at'] ?? now(),
                'updated_at' => $data['updated_at'] ?? now(),
            ]);
        }

        $json = file_get_contents(database_path('/csv/category_tree.json'));
        $categoryTreeData = json_decode($json, true);

        $childIdsInTree = [];
        foreach ($categoryTreeData as $data) {
            // Create the category tree structure
            DB::table('category_category')->insert([
                'parent_id' => $data['parent_category_id'],
                'child_id' => $data['category_id'],
                'order' => $data['category_order'],
                'created_at' => $data['created_at'] ?? now(),
                'updated_at' => $data['updated_at'] ?? now(),
            ]);
            $childIdsInTree[] = $data['category_id'];
        }

        // Get all category IDs that were just created
        $allCategoryIds = array_column($categoriesData, 'id');

        // Determine which categories were not included in the tree structure file.
        // These are assumed to be top-level categories.
        $missingTopLevelIds = array_diff($allCategoryIds, $childIdsInTree);

        // Add the missing categories as top-level entries in the pivot table.
        foreach ($missingTopLevelIds as $categoryId) {
            DB::table('category_category')->insert([
                'parent_id' => null,
                'child_id' => $categoryId,
                'order' => 0, // Default order for auto-added top-level categories
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
