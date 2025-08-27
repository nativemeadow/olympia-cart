<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $json = file_get_contents(database_path('/csv/product.json'));
        $products = json_decode($json, true);

        foreach ($products as $data) {
            \App\Models\Product::create([
                'id' => $data['id'],
                'uuid' => $data['uuid'],
                'sku' => $data['sku'],
                'title' => $data['title'],
                'slug' => $data['slug'],
                'description' => $data['description'],
                'image' => $data['image'],
                'status' => $data['status'] === 'Active',
                'created_at' => $data['created_at'] ?? now(),
                'updated_at' => $data['updated_at'] ?? now(),
            ]);
        }
    }
}
