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
        // Set default for created_at
        DB::statement('ALTER TABLE search_index ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;');

        // Create a trigger function to update the updated_at column
        DB::statement('
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
               NEW.updated_at = NOW();
               RETURN NEW;
            END;
            $$ language \'plpgsql\';
        ');

        // Add the trigger to the table
        DB::statement('
            CREATE TRIGGER update_search_index_updated_at
            BEFORE UPDATE ON search_index
            FOR EACH ROW
            EXECUTE PROCEDURE update_updated_at_column();
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the trigger
        DB::statement('DROP TRIGGER IF EXISTS update_search_index_updated_at ON search_index;');

        // Drop the trigger function
        DB::statement('DROP FUNCTION IF EXISTS update_updated_at_column();');

        // Remove the default from created_at
        DB::statement('ALTER TABLE search_index ALTER COLUMN created_at DROP DEFAULT;');
    }
};
