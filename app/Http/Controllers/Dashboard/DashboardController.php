<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class DashboardController extends Controller
{
    //
    public function index()
    {
        return Inertia::render('dashboard/index');
    }

    public function categories()
    {
        $query = File::get(database_path('schema/category-hierarchy.sql'));
        $results = DB::select($query);

        $categoriesData = [];
        foreach ($results as $row) {
            $category = (array) $row;
            $media = [];

            // Extract media fields into a nested array
            foreach ($category as $key => $value) {
                if (strpos($key, 'media_') === 0) {
                    $media[str_replace('media_', '', $key)] = $value;
                    unset($category[$key]);
                }
            }

            $category['media'] = $media['id'] ? $media : null;
            $categoriesData[] = $category;
        }

        $categories = $this->buildHierarchy($categoriesData);

        return Inertia::render('dashboard/categories/index', [
            'categories' => $categories,
        ]);
    }

    public function products()
    {
        ini_set('max_execution_time', 300);
        $query = File::get(
            database_path('schema/category-hierarchy-with-products.sql'),
        );
        $results = DB::select($query);
        $categories = [];

        $categoriesById = [];
        // Process the flat results to build a nested structure
        // This loop will create a mapping of categories, products, and variants
        foreach ($results as $row) {
            $categoryId = $row->category_id;

            // Initialize category if it doesn't exist
            if (!isset($categoriesById[$categoryId])) {
                // Initialize category with basic details
                $categoriesById[$categoryId] = [
                    'id' => $row->category_id,
                    'title' => $row->category_title,
                    'slug' => $row->category_slug,
                    'parent_id' => $row->parent_id,
                    'order' => $row->order,
                    'level' => $row->level,
                    'path' => $row->path,
                    'products' => [],
                ];
            }

            // Process product and variant data
            if ($row->product_id) {
                // Initialize product if it doesn't exist
                $productId = $row->product_id;
                // Check if the product already exists under the category
                if (!isset($categoriesById[$categoryId]['products'][$productId])) {
                    // Initialize product with basic details
                    $categoriesById[$categoryId]['products'][$productId] = [
                        'id' => $productId,
                        'uuid' => $row->product_uuid,
                        'title' => $row->product_title,
                        'slug' => $row->product_slug,
                        'description' => $row->product_description,
                        'sku' => $row->product_sku,
                        'status' => $row->product_status,
                        'image' => $row->product_image,
                        'variants' => [],
                    ];
                }

                // Process variant data if it exists
                if ($row->variant_id) {
                    // Check if the variant already exists under the product
                    $variantId = $row->variant_id;
                    // Initialize variant if it doesn't exist
                    if (!isset($categoriesById[$categoryId]['products'][$productId]['variants'][$variantId])) {
                        // build out price variant with basic details
                        $categoriesById[$categoryId]['products'][$productId]['variants'][$variantId] = [
                            'id' => $variantId,
                            'sku' => $row->variant_sku,
                            'price' => $row->variant_price,
                            'attributes' => [],
                        ];
                    }

                    // Process attribute data if it exists
                    if ($row->attribute_id) {
                        $attributeName = $row->attribute_name;
                        $attributeValue = $row->attribute_value;

                        // Handle special attributes by assigning them directly to the variant
                        if ($attributeName === 'Description') {
                            $categoriesById[$categoryId]['products'][$productId]['variants'][$variantId]['description'] = $attributeValue;
                        } elseif ($attributeName === 'Title') {
                            $categoriesById[$categoryId]['products'][$productId]['variants'][$variantId]['title'] = $attributeValue;
                        } elseif ($attributeName === 'Image') {
                            $categoriesById[$categoryId]['products'][$productId]['variants'][$variantId]['image'] = $attributeValue;
                        } else {
                            // Add other attributes to the 'attributes' array
                            $categoriesById[$categoryId]['products'][$productId]['variants'][$variantId]['attributes'][] = [
                                'id' => $row->attribute_id,
                                'name' => $attributeName,
                                'value' => $attributeValue,
                            ];
                        }
                    }
                }
            }
        }

        // Convert product and variant associative arrays to simple indexed arrays
        foreach ($categoriesById as &$category) {
            // Convert products to indexed array
            $category['products'] = array_values($category['products']);
            // Convert variants to indexed array for each product
            foreach ($category['products'] as &$product) {
                $product['variants'] = array_values($product['variants']);
            }
        }
        unset($category, $product); // Unset references

        $categories = $this->buildHierarchy($categoriesById);

        return Inertia::render('dashboard/products/index', [
            'categories' => $categories,
        ]);
    }

    function buildHierarchy(array $elements, $parentId = null)
    {
        $branch = [];

        foreach ($elements as $element) {
            if ($element['parent_id'] === $parentId) {
                $children = $this->buildHierarchy($elements, $element['id']);
                if ($children) {
                    $element['children'] = $children;
                }
                $branch[] = $element;
            }
        }

        return $branch;
    }
}
