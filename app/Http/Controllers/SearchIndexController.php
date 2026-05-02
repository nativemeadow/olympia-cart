<?php

namespace App\Http\Controllers;

use App\Services\ProductSearchService;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
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

        $productsQuery = Product::query();

        if (empty($orderedProductIds)) {
            $paginatedProducts = $productsQuery->whereIn('id', [])->paginate($perPage);
        } else {
            $order = [];
            foreach ($orderedProductIds as $index => $id) {
                $order[] = "WHEN id = {$id} THEN {$index}";
            }
            $orderClause = 'CASE ' . implode(' ', $order) . ' END';

            $paginatedProducts = $productsQuery->whereIn('id', $orderedProductIds)
                ->orderByRaw($orderClause)
                ->paginate($perPage);
        }

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
