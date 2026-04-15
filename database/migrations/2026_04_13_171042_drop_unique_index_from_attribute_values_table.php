<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attribute_values', function (Blueprint $table) {
            // Drop the index using its full name
            $table->dropIndex('idx_24750_attribute_values_attribute_id_value_unique');
        });
    }

    public function down(): void
    {
        Schema::table('attribute_values', function (Blueprint $table) {
            // Re-create the index in the down method so the migration is reversible
            $table->unique(['attribute_id', 'value'], 'idx_24750_attribute_values_attribute_id_value_unique');
        });
    }
};
