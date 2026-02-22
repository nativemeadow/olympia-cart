<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            // This adds a unique index to the file_name column.
            // The database will now reject any attempt to insert a
            // duplicate file_name.
            $table->unique('file_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            // This removes the unique index. The name of the index is
            // conventionally `table_column_unique`.
            $table->dropUnique('media_file_name_unique');
        });
    }
};
