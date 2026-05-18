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

        $productsQuery = DB::table('products')
            ->select('id', DB::raw('ts_rank(document, to_tsquery(\'english\', ?)) as rank'))
            ->whereRaw('document @@ to_tsquery(\'english\', ?)');

        $categoriesQuery = DB::table('categories')
            ->join('category_product', 'categories.id', '=', 'category_product.category_id')
            ->select('category_product.product_id as id', DB::raw('ts_rank(categories.document, to_tsquery(\'english\', ?)) as rank'))
            ->whereRaw('categories.document @@ to_tsquery(\'english\', ?)');

        $variantsQuery = DB::table('product_variants')
            ->select('product_id as id', DB::raw('ts_rank(document, to_tsquery(\'english\', ?)) as rank'))
            ->whereRaw('document @@ to_tsquery(\'english\', ?)');

        $results = $productsQuery
            ->unionAll($categoriesQuery)
            ->unionAll($variantsQuery)
            ->setBindings([
                $searchQuery, $searchQuery, // for products
                $searchQuery, $searchQuery, // for categories
                $searchQuery, $searchQuery, // for variants
            ])
            ->orderByDesc('rank')
            ->get();

        return $results->pluck('id')->unique()->values()->all();
    }
}
