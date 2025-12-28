<?php

namespace App\Console\Commands;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\ProductVariant;
use Dom\Attr;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigratePricesToVariants extends Command
{
    protected $signature = 'app:migrate-prices-to-variants';
    protected $description = 'Migrates data from the old prices table to the new product variants structure.';

    public function handle()
    {
        $this->info('Starting migration from prices to variants...');

        // Define the columns that describe a variant's unique properties.
        // We use the ALIAS 'online_minimum_aliased' for the problematic column.
        $attributeColumns = [
            'title',
            'description',
            'image',
            'currency',
            'size',
            'unit',
            'coverage',
            'coverage_value',
        ];

        DB::transaction(function () use ($attributeColumns) {
            AttributeValue::query()->truncate();
            ProductVariant::query()->truncate();
            Attribute::query()->truncate();
            DB::table('attribute_value_product_variant')->truncate();

            // 1. Pre-create the parent Attribute records.
            $attributes = [];
            foreach ($attributeColumns as $columnName) {
                // Create a readable name, e.g., "online_minimum_aliased" becomes "Online Minimum".
                $name = str_replace(['-', '_'], ' ', ucfirst($columnName));

                $attributes[$columnName] = Attribute::firstOrCreate(['name' => $name]);
                $this->line("Ensured Attribute exists: " . $name);
            }

            // THE FIX: Explicitly select all columns and create a safe alias for 'online-minimum'.
            // Note the use of DB::raw() to handle the backticks and aliasing.
            $oldPricesQuery = DB::table('prices')->select(
                'id',
                'product_id',
                'sku',
                'price',
                'created_at',
                'updated_at',
                'title',
                'description',
                'image',
                'currency',
                'size',
                'unit',
                'coverage',
                'coverage_value',
            );

            // 2. Use a cursor on the modified query.
            foreach ($oldPricesQuery->cursor() as $oldPrice) {
                if (empty($oldPrice->sku)) {
                    $this->warn("Skipping price ID {$oldPrice->id} due to empty SKU.");
                    continue;
                }
                // Since SKU is not unique, we create a new variant for each price record.
                $variant = ProductVariant::create([
                    'sku' => $oldPrice->sku,
                    'product_id' => $oldPrice->product_id,
                    'price' => (int) ($oldPrice->price * 100),
                    'created_at' => $oldPrice->created_at,
                    'updated_at' => $oldPrice->updated_at,
                ]);

                // Optional: Log whether we created a new variant or found an existing one.
                if ($variant->wasRecentlyCreated) {
                    $this->line("Created variant for SKU: {$variant->sku}");
                } else {
                    $this->line("Found existing variant for SKU: {$variant->sku}. Merging attributes.");
                }

                $attributeValueIds = [];

                // 4. For each potential attribute column, create the AttributeValue if a value exists.
                foreach ($attributeColumns as $columnName) {
                    // This now works because we are accessing the safe alias 'online_minimum_aliased'.
                    $value = $oldPrice->{$columnName};

                    if (!is_null($value) && $value !== '') {
                        $attribute = $attributes[$columnName];
                        $attributeValue = AttributeValue::firstOrCreate([
                            'attribute_id' => $attribute->id,
                            'value' => $value,
                        ]);
                        $attributeValueIds[] = $attributeValue->id;
                    }
                }

                // 5. Attach all found attribute values to the new variant.
                if (!empty($attributeValueIds)) {
                    $variant->attributeValues()->sync($attributeValueIds);
                    $this->line("-> Attached " . count($attributeValueIds) . " attribute values.");
                }
            }
        });

        $this->info('Migration completed successfully!');
        return 0;
    }
}
