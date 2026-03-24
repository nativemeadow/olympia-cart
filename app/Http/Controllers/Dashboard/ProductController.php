<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\Product;
use App\Models\Media;
use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
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
        $attributes = Attribute::with('values')->get(['name', 'data_type', 'list_of_values']);

        return response()->json([
            'allAttributes' => $attributes,
        ]);
    }

    private function handleDerivedAttributes($priceData, $attributeName = null, $isCreate = true)
    {
        $attributesToSync = [];

        // Handle attribute
        if (!empty($priceData[$attributeName])) {
            $attribute = Attribute::firstOrCreate(['name' => ucfirst($attributeName), 'data_type' => 'string']);
            $attributeValue = $isCreate
                ? AttributeValue::firstOrCreate(['attribute_id' => $attribute->id, 'value' => $priceData[$attributeName]])
                : AttributeValue::updateOrCreate(
                    ['attribute_id' => $attribute->id, 'value' => $priceData[$attributeName]]
                );
            $attributesToSync[] = $attributeValue->id;
        }
        return $attributesToSync;
    }

    private function handleImageAttribute($priceData, $isCreate = true)
    {
        $attributesToSync = [];
        if (!empty($priceData['image'])) {
            $attribute = Attribute::firstOrCreate(['name' => 'Image', 'data_type' => 'string']);
            $image_name = $priceData['image']['file_name'];
            $attributeValue = $isCreate
                ? AttributeValue::firstOrCreate(['attribute_id' => $attribute->id, 'value' => $image_name])
                : AttributeValue::updateOrCreate(
                    ['attribute_id' => $attribute->id, 'value' => $image_name]
                );
            $attributesToSync[] = $attributeValue->id;
        }
        return $attributesToSync;
    }

    public function store(Request $request, $categoryId)
    {
        $validatedData = $request->validate([
            'product.title' => 'required|string|max:255',
            'product.sku' => 'required|string|max:255|unique:products,sku',
            'product.slug' => 'required|string|max:255|unique:products,slug',
            'product.description' => 'nullable|string',
            'product.image' => 'nullable|string|max:255',
            'product.status' => 'required|boolean',
            'product.categories.*.id' => 'required_with:product.categories|integer|exists:categories,id',
            'product.prices' => 'required|array|min:1',
            'product.prices.*.sku' => 'nullable|string|max:255|unique:product_variants,sku',
            'product.prices.*.price' => 'required|numeric|min:1',
            'product.prices.*.extended_properties' => 'nullable|array',
            'product.prices.*.title' => 'nullable|string',
            'product.prices.*.description' => 'nullable|string',
            'product.prices.*.image' => 'nullable|array',
        ], [
            'product.title.required' => 'The product title is required.',
            'product.sku.required' => 'The product SKU is required.',
            'product.sku.unique' => 'The product SKU must be unique.',
            'product.slug.required' => 'The product slug is required.',
            'product.slug.unique' => 'The product slug must be unique.',
            'product.status.required' => 'The product status is required.',
            'product.status.boolean' => 'The product must have a status.',
            'product.categories.*.id.required_with' => 'Each category must have an ID.',
            'product.categories.*.id.integer' => 'Each category ID must be an integer.',
            'product.categories.*.id.exists' => 'Each category ID must exist in the categories table.',
            'product.prices.required' => 'At least one price is required.',
            'product.prices.*.sku.required' => 'Price must have a SKU.',
            'product.prices.*.sku.unique' => 'Price SKU must be unique.',
            'product.prices.*.price.required' => 'Price must have a value.',
            'product.prices.*.price.numeric' => 'Price value must be numeric.',
            'product.prices.*.price.min' => 'Price value must be at least 1.',
        ]);

        $productData = $validatedData['product'];

        DB::beginTransaction();

        try {
            $product = Product::create([
                'title' => $productData['title'],
                'uuid' => Str::uuid(),
                'sku' => $productData['sku'],
                'slug' => $productData['slug'],
                'description' => $productData['description'],
                'image' => $productData['image'],
                'status' => $productData['status'],
            ]);

            // A new product is always created within a single category context.
            // We calculate the order for the product within that category.
            $maxOrder = DB::table('category_product')
                ->where('category_id', $categoryId)
                ->max('product_order');

            // Attach the product to its primary category with the correct order and SKU.
            $product->categories()->attach($categoryId, [
                'product_order' => ($maxOrder ?? 0) + 1,
                'sku' => $productData['sku'],
            ]);

            foreach ($productData['prices'] as $priceData) {
                $variant = $product->variants()->create([
                    'sku' => $priceData['sku'],
                    'price' => $priceData['price'],
                ]);

                $attributesToSync = [];

                // Handle title
                $attributesToSync = array_merge($attributesToSync, $this->handleDerivedAttributes($priceData, 'title'));

                // Handle description
                $attributesToSync = array_merge($attributesToSync, $this->handleDerivedAttributes($priceData, 'description'));

                // Handle image
                $attributesToSync = array_merge($attributesToSync, $this->handleImageAttribute($priceData));

                // Handle extended_properties
                if (isset($priceData['extended_properties'])) {
                    foreach ($priceData['extended_properties'] as $name => $value) {
                        if (!empty($value)) {
                            $attribute = Attribute::where('name', $name)->first();
                            if ($attribute) {
                                $attributeValue = AttributeValue::firstOrCreate([
                                    'attribute_id' => $attribute->id,
                                    'value' => $value,
                                ]);
                                $attributesToSync[] = $attributeValue->id;
                            }
                        }
                    }
                }

                $variant->attributeValues()->sync($attributesToSync);
            }

            DB::commit();

            return redirect()->route('dashboard.products')->with('success', 'Product created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validatedData = $request->validate([
            'product.title' => 'required|string|max:255',
            'product.sku' => ['required', 'string', 'max:255', Rule::unique('products', 'sku')->ignore($product->id)],
            'product.slug' => ['required', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($product->id)],
            'product.description' => 'nullable|string',
            'product.image' => 'nullable|string|max:255',
            'product.status' => 'required|boolean',
            'product.categories.*.id' => 'required_with:product.categories|integer|exists:categories,id',
            'product.prices' => 'required|array|min:1',
            'product.prices.*.id' => 'nullable|integer',
            'product.prices.*.sku' => ['nullable', 'string', 'max:255', Rule::unique('product_variants', 'sku')->where(function ($query) use ($request) {
                $priceIds = collect($request->input('product.prices'))->pluck('id')->filter();
                if ($priceIds->isNotEmpty()) {
                    return $query->whereNotIn('id', $priceIds);
                }
            })],
            'product.prices.*.price' => 'required|numeric|min:1',
            'product.prices.*.extended_properties' => 'nullable|array',
            'product.prices.*.title' => 'nullable|string',
            'product.prices.*.description' => 'nullable|string',
            'product.prices.*.image' => 'nullable|array',
        ], [
            'product.title.required' => 'The product title is required.',
            'product.sku.required' => 'The product SKU is required.',
            'product.sku.unique' => 'The product SKU must be unique.',
            'product.slug.required' => 'The product slug is required.',
            'product.slug.unique' => 'The product slug must be unique.',
            'product.status.required' => 'The product status is required.',
            'product.status.boolean' => 'The product must have a status.',
            'product.categories.*.id.required_with' => 'Each category must have an ID.',
            'product.categories.*.id.integer' => 'Each category ID must be an integer.',
            'product.categories.*.id.exists' => 'Each category ID must exist in the categories table.',
            'product.prices.required' => 'At least one price is required.',
            'product.prices.*.sku.required' => 'Each price must have a SKU.',
            'product.prices.*.sku.unique' => 'Price SKU must be unique.',
            'product.prices.*.price.required' => 'Price must have a price value.',
            'product.prices.*.price.numeric' => 'Price value must be numeric.',
            'product.prices.*.price.min' => 'Price must be at least 1.',
        ]);

        $productData = $validatedData['product'];

        DB::beginTransaction();

        try {
            $product->update([
                'title' => $productData['title'],
                'sku' => $productData['sku'],
                'slug' => $productData['slug'],
                'description' => $productData['description'],
                'image' => $productData['image'],
                'status' => $productData['status'],
            ]);

            if (isset($productData['categories'])) {
                $product->categories()->sync(array_column($productData['categories'], 'id'));
            }

            $priceIds = [];

            // update the sku in the category_product pivot table if the product sku has changed
            if (isset($productData['categories'])) {
                foreach ($productData['categories'] as $categoryData) {
                    $categoryId = $categoryData['id'];
                    DB::table('category_product')->where('category_id', $categoryId)->where('product_id', $product->id)->update(['sku' => $productData['sku']]);
                }
            }

            foreach ($productData['prices'] as $priceData) {
                $variant = $product->variants()->updateOrCreate(
                    ['id' => $priceData['id'] ?? null],
                    [
                        'sku' => $priceData['sku'],
                        'price' => $priceData['price'],
                    ]
                );
                $priceIds[] = $variant->id;

                $attributesToSync = [];

                // Handle title
                $attributesToSync = array_merge($attributesToSync, $this->handleDerivedAttributes($priceData, 'title'));

                // Handle description
                $attributesToSync = array_merge($attributesToSync, $this->handleDerivedAttributes($priceData, 'description'));

                // Handle image
                $attributesToSync = array_merge($attributesToSync, $this->handleImageAttribute($priceData, false));

                // Handle extended_properties
                if (isset($priceData['extended_properties'])) {
                    foreach ($priceData['extended_properties'] as $name => $value) {
                        if (!empty($value)) {
                            $attribute = Attribute::where('name', $name)->first();
                            if ($attribute) {
                                $attributeValue = AttributeValue::updateOrCreate(
                                    ['attribute_id' => $attribute->id, 'value' => $value]
                                );
                                $attributesToSync[] = $attributeValue->id;
                            }
                        }
                    }
                }

                $variant->attributeValues()->sync($attributesToSync);
            }

            // Delete variants that are no longer in the request
            $product->variants()->whereNotIn('id', $priceIds)->delete();

            DB::commit();
            return redirect()->route('dashboard.products')->with('success', 'Product updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return redirect()->route('dashboard.products')->with('success', 'Product deleted successfully.');
    }

    public function productMedia(Request $request)
    {
        $sort = $request->query('sort_column', 'created_at');
        $order = $request->query('order', 'desc');
        $perPage = $request->query('per_page', 10);
        $searchTerm = $request->query('search_term', '');

        $media = Media::query()
            ->where('type', 'products')
            ->when($searchTerm, function ($query, $searchTerm) {
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('title', 'like', "%{$searchTerm}%")
                        ->orWhere('alt_text', 'like', "%{$searchTerm}%");
                });
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

    // public function reorderProducts($orderArray)
    // {
    //     foreach ($orderArray as $index => $productId) {
    //         Product::where('id', $productId)->update(['sort_order' => $index]);
    //     }

    //     return response()->json(['message' => 'Products reordered successfully.']);
    // }
}
