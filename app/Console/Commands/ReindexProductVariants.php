<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\SearchIndex;
use Illuminate\Support\Facades\DB;

class ReindexProductVariants extends Command
{
    protected $signature = 'search:reindex-variants';
    protected $description = 'Re-indexes product variants for full-text search, including attributes.';

    public function handle()
    {
        $this->info('Starting product variant re-indexing...');

        // 1. Clear existing product and variant entries from the search index
        SearchIndex::where('source_table', 'products')->delete();
        SearchIndex::where('source_table', 'product_variants')->delete();
        SearchIndex::where('source_table', 'prices')->delete(); // Also clear prices
        $this->info('Cleared existing product and variant search index.');

        // 2. Get all products with their variants and related attributes
        $products = Product::with(['variants.attributeValues.attribute'])->get();
        $this->info("Found {$products->count()} products to index.");

        $searchIndexData = [];

        foreach ($products as $product) {
            // --- Index the main product ---
            $searchIndexData[] = [
                'title' => $product->title,
                'description' => strip_tags($product->description ?? ''),
                'source_table' => 'products',
                'source_id' => $product->id,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // --- Index each product variant ---
            foreach ($product->variants as $variant) {
                $variantTitle = $product->title;
                $variantDescription = '';
                $variantContent = [];

                // Consolidate attribute values for the variant
                foreach ($variant->attributeValues as $attrValue) {
                    $attributeName = $attrValue->attribute->name;
                    // Use specific attributes for title and description if they exist
                    if (strtolower($attributeName) === 'title') {
                        $variantTitle = $attrValue->value;
                    } elseif (strtolower($attributeName) === 'description') {
                        $variantDescription = strip_tags($attrValue->value ?? '');
                    } else {
                        // Add other attributes to a general content field
                        $variantContent[] = $attrValue->value;
                    }
                }

                // Combine all text content for the variant
                $fullDescription = implode(' ', array_merge(
                    [$product->title, strip_tags($product->description ?? '')],
                    [$variantDescription],
                    $variantContent
                ));

                $searchIndexData[] = [
                    'title' => $variantTitle,
                    'description' => $fullDescription,
                    'source_table' => 'product_variants',
                    'source_id' => $variant->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // 3. Batch insert the new data for efficiency
        if (!empty($searchIndexData)) {
            SearchIndex::insert($searchIndexData);
        }

        $this->info('Successfully re-indexed all products and their variants.');
        return 0;
    }
}
