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
        DB::statement('DROP FUNCTION IF EXISTS sync_search_index CASCADE');
        DB::statement('DROP VIEW IF EXISTS search_index_view CASCADE');
        DB::statement('DROP TABLE IF EXISTS search_index CASCADE');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a destructive migration. Re-creating the table and view
        // would require knowledge of their original structure.
        // If you need to roll back, it's best to restore from a backup
        // or rerun the original migrations that created them.
    }
};
