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
        $categories = json_decode($json, true);


        foreach ($categories as $data) {
            \App\Models\Category::create([
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
        $categories = json_decode($json, true);

        foreach ($categories as $data) {
            // Create the category tree structure
            DB::table('category_category')->insert([
                'parent_id' => $data['parent_category_id'],
                'child_id' => $data['category_id'],
                'order' => $data['category_order'],
                'created_at' => $data['created_at'] ?? now(),
                'updated_at' => $data['updated_at'] ?? now(),
            ]);
        }
    }
}
