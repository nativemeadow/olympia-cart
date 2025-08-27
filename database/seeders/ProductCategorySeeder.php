<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductCategorySeeder extends Seeder
{
    public function run(): void
    {
        $json = file_get_contents(database_path('/csv/category_product.json'));
        $rows = json_decode($json, true);

        foreach ($rows as $row) {
            DB::table('category_product')->updateOrInsert(
                [
                    'category_id' => $row['category_id'],
                    'product_id' => $row['product_id'],
                ],
                [
                    'sku' => $row['sku'] ?? null,
                    'product_order' => $row['product_order'] ?? null,
                    'created_at' => $row['created_at'] ?? now(),
                    'updated_at' => $row['updated_at'] ?? now(),
                ]
            );
        }
    }
}
