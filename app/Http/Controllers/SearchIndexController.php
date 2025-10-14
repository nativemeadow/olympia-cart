<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Price;
use Inertia\Response;



class SearchIndexController extends Controller
{
    //

    public function index($searchTerm = null)
    {
        if (!$searchTerm) {
            // If no search term, just render the page with empty results.
            return Inertia::render('search/index', [
                'results' => [],
                'searchTerm' => '',
            ]);
        }

        $searchIndex = new \App\Models\SearchIndex();
        $results = $searchIndex->search($searchTerm);

        $productIds = [];
        foreach ($results as $result) {
            // Add the rank to the result object for later sorting
            $result->rank = $result->rank ?? 0;

            if ($result->source_table === 'products') {
                $productIds[$result->source_id] = $result->rank;
            } else if ($result->source_table === 'prices') {
                // Find the price and then get its product_id
                $price = Price::find($result->source_id);
                if ($price) {
                    // If the product isn't already in the list, or if this match has a higher rank
                    if (!isset($productIds[$price->product_id]) || $productIds[$price->product_id] < $result->rank) {
                        $productIds[$price->product_id] = $result->rank;
                    }
                }
            }
        }

        // Get unique product IDs from the keys
        $uniqueProductIds = array_keys($productIds);

        if (empty($uniqueProductIds)) {
            return Inertia::render('search/index', [
                'results' => [],
                'searchTerm' => $searchTerm,
            ]);
        }

        // Eager load products with their prices
        $products = Product::whereIn('id', $uniqueProductIds)->with('prices')->get()->map(function ($product) use ($productIds) {
            // Attach the rank to the product for sorting
            $product->rank = $productIds[$product->id] ?? 0;
            $product->categories; // Load categories if needed
            return $product;
        });



        // Sort the final product list by rank
        $sortedProducts = $products->sortByDesc('rank')->values();

        return Inertia::render('search/index', [
            'results' => $sortedProducts,
            'searchTerm' => $searchTerm,
            'resultCount' => count($sortedProducts),
        ]);
    }
}
