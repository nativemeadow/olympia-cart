<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 50 categories
        $categories = \App\Models\Category::factory(50)->create();

        // Assign random parent-child relationships
        foreach ($categories as $category) {
            // Each category can have 0-3 children
            $children = $categories->where('id', '!=', $category->id)->random(rand(0, 3))->pluck('id')->all();
            // Avoid circular and duplicate relationships
            $order = 1;
            foreach ($children as $childId) {
                // Prevent circular relationship (child is parent of parent)
                if (!in_array($category->id, \App\Models\Category::find($childId)->children->pluck('id')->all())) {
                    $category->children()->syncWithoutDetaching([
                        $childId => ['order' => $order]
                    ]);
                    $order++;
                }
            }
        }
    }
}
