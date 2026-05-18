<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("UPDATE products SET document = to_tsvector('english', title || ' ' || description)");
        DB::statement("UPDATE categories SET document = to_tsvector('english', title || ' ' || description)");
        DB::statement("
            UPDATE product_variants pv
            SET document = to_tsvector('english', p.title || ' ' || pv.sku || ' ' || COALESCE((
                SELECT string_agg(attr.name || ': ' || val.value, ', ')
                FROM attribute_value_product_variant avpv
                JOIN attribute_values val ON avpv.attribute_value_id = val.id
                JOIN attributes attr ON val.attribute_id = attr.id
                WHERE avpv.product_variant_id = pv.id
            ), ''))
            FROM products p
            WHERE pv.product_id = p.id;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE products SET document = NULL");
        DB::statement("UPDATE categories SET document = NULL");
        DB::statement("UPDATE product_variants SET document = NULL");
    }
};
