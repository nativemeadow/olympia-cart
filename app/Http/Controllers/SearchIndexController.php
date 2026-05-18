<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductSearchResource;
use App\Services\ProductSearchService;
use Illuminate\Http\Request;
use App\Models\Product;
use Inertia\Inertia;

class SearchIndexController extends Controller
{
    protected $productSearchService;

    public function __construct(ProductSearchService $productSearchService)
    {
        $this->productSearchService = $productSearchService;
    }

    public function index(Request $request, string $searchTerm = null)
    {
        $query = $searchTerm ?? $request->input('term', '');
        $perPage = $request->input('per_page', 10);

        $orderedProductIds = $this->productSearchService->search($query);

        $productsQuery = Product::with([
            'lowestPriceVariant',
            'categories',
        ]);

        if (empty($orderedProductIds)) {
            $products = $productsQuery->whereIn('id', [])->paginate($perPage);
        } else {
            $order = [];
            foreach ($orderedProductIds as $index => $id) {
                $order[] = "WHEN id = {$id} THEN {$index}";
            }
            $orderClause = 'CASE ' . implode(' ', $order) . ' END';

            $products = $productsQuery->whereIn('id', $orderedProductIds)
                ->orderByRaw($orderClause)
                ->paginate($perPage);
        }

        $paginatedProducts = $products->through(fn($product) => new ProductSearchResource($product));

        $paginatedProducts->appends(['term' => $query]);

        if ($request->wantsJson()) {
            return response()->json($paginatedProducts);
        }

        return Inertia::render('search/index', [
            'products' => $paginatedProducts,
            'searchTerm' => $query,
        ]);
    }
}
