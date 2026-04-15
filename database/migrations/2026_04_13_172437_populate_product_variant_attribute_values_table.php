<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ensure the old table exists before trying to select from it
        if (Schema::hasTable('attribute_value_product_variant')) {

            // Use a raw SQL query for maximum efficiency
            DB::statement('
                INSERT INTO product_variant_attribute_values (product_variant_id, attribute_value_id, created_at, updated_at)
                SELECT 
                    product_variant_id, 
                    attribute_value_id,
                    NOW(),
                    NOW()
                FROM attribute_value_product_variant
                ON CONFLICT (product_variant_id, attribute_value_id) DO NOTHING;
            ');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // If we roll back, we just clear out the new table.
        DB::table('product_variant_attribute_values')->truncate();
    }
};
