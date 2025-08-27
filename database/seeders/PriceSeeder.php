<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PriceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $json = file_get_contents(database_path('/csv/price.json'));
        $price = json_decode($json, true);

        foreach ($price as $item) {
            //dd($item);
            \App\Models\Price::create([
                'id' => $item['id'],
                'product_id' => $item['product_id'],
                'sku' => $item['sku'],
                'title' => $item['title'] ?? null,
                'description' => $item['description'] ?? null,
                'image' => $item['image'] ?? null,
                'price' => $item['price'],
                'currency' => 'USD',
                'unit' => $item['units'],
                'size' => $item['size'] ?? null,
                'coverage' => $item['coverage'] ?? null,
                'coverage_value' => $item['coverage_value'] ?? null,
                'online_minimum' => $item['online_minimum'] ?? null,
                'created_at' => $item['created_at'] ?? now(),
                'updated_at' => $item['updated_at'] ?? now(),
            ]);
        }

        // \App\Models\Price::create([
        //     'id' => 780,
        //     'product_id' => 341,
        //     'sku' => 'ASNLS',
        //     'title' => 'Arizona Snap Ledger Stone per pound',
        //     'description' => 'per lbs',
        //     'image' => "",
        //     'price' => 0.31,
        //     'currency' => 'USD',
        //     'unit' => 'lbs',
        //     'size' => '',
        //     'coverage' => '',
        //     'coverage_value' => 0,
        //     'online_minimum' => 0,
        //     'created_at' => '2025-03-31T17:21:00',
        //     'updated_at' => now(),
        // ]);
    }
}
