<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ImagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $json = file_get_contents(database_path('/csv/image.json'));
        $images = json_decode($json, true);

        foreach ($images as $image) {
            \App\Models\Images::create([
                'name' => $image['name'],
                'description' => $image['description'],
                'image' => $image['image'],
                'category' => $image['category'],
                'created_at' => $image['created_at'] ?? now(),
                'updated_at' => $image['updated_at'] ?? now(),
            ]);
        }
    }
}
