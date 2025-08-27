<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory(10)->create();
        //Category::factory(10)->create();
        // $this->call(CategorySeeder::class);
        $this->call(CategoryPGSeeder::class);
        $this->call(ProductSeeder::class);
        $this->call(PriceSeeder::class);
        $this->call(ProductCategorySeeder::class);
        $this->call(ImagesSeeder::class);

        // User::factory()->create([
        //     'first_name' => 'Test',
        //     'last_name' => 'User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
