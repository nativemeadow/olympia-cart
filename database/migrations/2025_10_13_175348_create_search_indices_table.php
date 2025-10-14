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
        // Drop the table if it exists, to be safe when re-running migrations.
        DB::statement('DROP TABLE IF EXISTS search_index');

        // Create the FTS5 virtual table
        DB::statement("
            CREATE VIRTUAL TABLE search_index USING fts5(
                title, description,
                source_table UNINDEXED, source_id UNINDEXED,
                tokenize = 'porter unicode61'
            );
        ");
        DB::statement('
            -- After a new product is inserted, add it to the search index.
            CREATE TRIGGER products_after_insert AFTER INSERT ON products BEGIN
            INSERT INTO
                search_index (title, description, source_table, source_id)
            VALUES
                (new.title, new.description, \'products\', new.id);

            END;
        ');

        DB::statement('
            -- After a product is deleted, remove it from the search index.
            CREATE TRIGGER products_after_delete AFTER DELETE ON products BEGIN
            DELETE FROM search_index
            WHERE
                source_table = \'products\'
                AND source_id = old.id;

            END;
        ');

        DB::statement('
            -- After a product is updated, update the corresponding entry in the search index.
            CREATE TRIGGER products_after_update AFTER UPDATE ON products BEGIN
                UPDATE search_index SET title = new.title, description = new.description
                WHERE source_table = \'products\' AND source_id = new.id;
            END;
        ');

        DB::statement('
            -- After a new categories is inserted, add it to the search index.
            CREATE TRIGGER categories_after_insert AFTER INSERT ON categories BEGIN
            INSERT INTO
                search_index (title, description, source_table, source_id)
            VALUES
                (new.title, new.description, \'categories\', new.id);

            END;
        ');

        DB::statement('
            -- After a category is deleted, remove it from the search index.
            CREATE TRIGGER categories_after_delete AFTER DELETE ON categories BEGIN
            DELETE FROM search_index
            WHERE
                source_table = \'categories\'
                AND source_id = old.id;
            END;
        ');

        DB::statement('
            -- After a new price is inserted, add it to the search index.
            CREATE TRIGGER prices_after_insert AFTER INSERT ON prices BEGIN
            INSERT INTO
                search_index (title, description, source_table, source_id)
            VALUES
                (new.title, new.description, \'prices\', new.id);

            END;
        ');

        DB::statement('
            -- After a price is deleted, remove it from the search index.
            CREATE TRIGGER prices_after_delete AFTER DELETE ON prices BEGIN
            DELETE FROM search_index
            WHERE
                source_table = \'prices\'
                AND source_id = old.id;
            END;
        ');

        DB::statement('
            -- After a price is updated, update the corresponding entry in the search index.
            CREATE TRIGGER prices_after_update AFTER UPDATE ON prices BEGIN
                UPDATE search_index SET title = new.title, description = new.description
                WHERE source_table = \'prices\' AND source_id = new.id;
            END;
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('search_index');
        DB::statement('DROP TRIGGER IF EXISTS products_after_insert');
        DB::statement('DROP TRIGGER IF EXISTS products_after_delete');
        DB::statement('DROP TRIGGER IF EXISTS products_after_update');
        DB::statement('DROP TRIGGER IF EXISTS categories_after_insert');
        DB::statement('DROP TRIGGER IF EXISTS categories_after_delete');
        DB::statement('DROP TRIGGER IF EXISTS prices_after_insert');
        DB::statement('DROP TRIGGER IF EXISTS prices_after_delete');
        DB::statement('DROP TRIGGER IF EXISTS prices_after_update');
    }
};
