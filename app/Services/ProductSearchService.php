<?php

namespace App\Services;

use App\Models\ProductVariant;
use App\Models\SearchIndex;
use Illuminate\Support\Facades\DB;

class ProductSearchService
{
    public function search(string $query): array
    {
        if (empty($query)) {
            return [];
        }

        $searchQuery = implode(' & ', array_filter(explode(' ', $query)));

        if (empty($searchQuery)) {
            return [];
        }

        // 1. Perform the initial ranked search (fast with GIN index)
        $results = SearchIndex::query()
            ->select('source_table', 'source_id')
            ->addSelect(DB::raw('ts_rank(search_vector, to_tsquery(\'english\', ?)) as rank'))
            ->whereRaw('search_vector @@ to_tsquery(\'english\', ?)', [$searchQuery, $searchQuery])
            ->orderByDesc('rank')
            ->get();

        $variantIds = $results
            ->where('source_table', 'product_variants')
            ->pluck('source_id');

        // 2. Fetch all variant info in a single query to create a lookup map.
        $variantProductMap = ProductVariant::whereIn('id', $variantIds)
            ->pluck('product_id', 'id');

        // 3. Build the final, ranked list of product IDs using the fast lookup map.
        $orderedIds = $results->map(function ($result) use ($variantProductMap) {
            if ($result->source_table === 'products') {
                return (int) $result->source_id;
            }

            if ($result->source_table === 'product_variants') {
                return $variantProductMap[$result->source_id] ?? null;
            }

            return null;
        })->filter()->unique()->values()->all();

        return $orderedIds;
    }
}
