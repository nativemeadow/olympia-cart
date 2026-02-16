<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\Customer;
use App\Models\User;

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
        $categories = DB::select($query);

        $categories = $this->buildHierarchy(json_decode(json_encode($categories), true));

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
        foreach ($results as $row) {
            $categoryId = $row->category_id;

            if (!isset($categoriesById[$categoryId])) {
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

            if ($row->product_id) {
                $categoriesById[$categoryId]['products'][$row->product_id] = [
                    'id' => $row->product_id,
                    'uuid' => $row->product_uuid,
                    'title' => $row->product_title,
                    'slug' => $row->product_slug,
                    'description' => $row->product_description,
                    'sku' => $row->product_sku,
                    'status' => $row->product_status,
                    'image' => $row->product_image,
                ];
            }
        }

        // Convert product associative arrays to simple indexed arrays
        foreach ($categoriesById as &$category) {
            $category['products'] = array_values($category['products']);
        }
        unset($category); // Unset reference

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
