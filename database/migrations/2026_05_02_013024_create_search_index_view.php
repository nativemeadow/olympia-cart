<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("
            CREATE OR REPLACE VIEW search_index_view AS
            SELECT
                -- Create a unique ID for the view
                (si.source_table || '-' || si.source_id) AS id,
                si.title,
                si.description,
                si.source_table,
                si.source_id,
                si.search_vector,
                CASE
                    WHEN si.source_table = 'products' THEN si.source_id::bigint
                    WHEN si.source_table = 'product_variants' THEN pv.product_id
                    ELSE NULL
                END AS product_id
            FROM
                search_index si
            LEFT JOIN
                product_variants pv ON si.source_id::bigint = pv.id AND si.source_table = 'product_variants'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS search_index_view");
    }
};
