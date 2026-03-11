<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\Product;
use App\Models\Media;
use App\Http\Controllers\Controller;
use App\Models\Attribute;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    //
    public function show($product_id)
    {
        // get the product with its categories and variants and variants associated with the product
        $product = Product::with([
            'categories',
            'variants' => function ($query) {
                $query->with('attributeValues.attribute');
            },
            'media',
        ])->find($product_id);

        if (!$product) {
            return response()->json(['product' => null], 404);
        }

        $productArray = $product->toArray();

        if (isset($productArray['variants'])) {
            $productArray['prices'] = $productArray['variants'];
            unset($productArray['variants']);

            // Unset the now-redundant attribute_values from each price
            foreach ($productArray['prices'] as &$price) {
                if (isset($price['attribute_values'])) {
                    unset($price['attribute_values']);
                }
            }
        }

        $allAttributes = Attribute::distinct()->get(['name', 'data_type']);

        return response()->json([
            'product' => $productArray,
            'allAttributes' => $allAttributes,
        ]);
    }

    public function getPriceAttributes()
    {
        $attributes = Attribute::with('values')->get(['name', 'data_type']);

        return response()->json([
            'allAttributes' => $attributes,
        ]);
    }

    public function store(Request $request)
    {
        // This is handled by the DashboardController, which is fine.
    }

    public function update(Request $request, $id)
    {
        // This is handled by the DashboardController, which is fine.
    }

    public function destroy($id)
    {
        // This is handled by the DashboardController, which is fine.
    }

    public function productMedia(Request $request)
    {
        $sort = $request->query('sort_column', 'created_at');
        $order = $request->query('order', 'desc');
        $perPage = $request->query('per_page', 10);
        $searchTerm = $request->query('search_term', '');

        $media = Media::query()
            ->when($searchTerm, function ($query, $searchTerm) {
                $query->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('alt_text', 'like', "%{$searchTerm}%");
            })
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->withQueryString();

        // Transform the collection to add the full URL
        $media->through(function ($item) {
            // Use the asset() helper to generate the full, correct URL.
            $item->url = asset($item->file_path);
            return $item;
        });

        // return a json response with the media and the pagination data
        return response()->json([
            'media' => [
                'data' => $media->items(),
                'links' => $media->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $media->currentPage(),
                    'from' => $media->firstItem(),
                    'to' => $media->lastItem(),
                    'total' => $media->total(),
                    'path' => $media->path(),
                    'per_page' => $media->perPage(),
                    'last_page' => $media->lastPage(),
                ],
            ],
            'filters' => $request->only(['sort_column', 'order', 'per_page', 'search_term']),
        ]);
    }
}
