<?php

use App\Http\Controllers\Dashboard\CategoryController;
use App\Http\Controllers\Dashboard\ProductController;
use App\Http\Controllers\Dashboard\MediaController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\CustomersController;
use App\Http\Controllers\Dashboard\CustomerController;
use App\Http\Controllers\Dashboard\OrderController;
use App\Http\Controllers\Dashboard\ProductOrderController;
use App\Http\Controllers\Dashboard\CategoryOrderController;
use App\Http\Controllers\Dashboard\CustomersOrdersController;
use App\Http\Controllers\Dashboard\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('dashboard')
    ->middleware(['auth', 'role:Admin'])
    ->name('dashboard.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('index');

        Route::get('/categories', [
            DashboardController::class,
            'categories',
        ])->name('categories.index');

        Route::put('categories/order', CategoryOrderController::class)->name(
            'categories.order',
        );

        Route::resource('categories', CategoryController::class)->except([
            'index',
            'create',
            'show',
            'edit',
        ]);

        Route::get('/category/media/{sort_column?}/{order?}/{search_term?}', [CategoryController::class, 'categoryMedia'])->name('category.media');

        Route::post('/category/store/{parentId}', [CategoryController::class, 'store'])->name('category.store');
        Route::put('/category/update/{categoryId}', [CategoryController::class, 'update'])->name('category.update');
        Route::delete('/category/destroy/{categoryId}', [CategoryController::class, 'destroy'])->name('category.destroy');

        Route::get('/products', [DashboardController::class, 'products'])->name(
            'products',
        );

        Route::put('products/order', ProductOrderController::class)->name(
            'products.order',
        );

        Route::get('/product/media/{sort_column?}/{order?}/{search_term?}', [ProductController::class, 'productMedia'])->name('product.media');

        Route::get('/product/{product_id}', [
            ProductController::class,
            'show',
        ])->name('product.show');

        Route::post('/products/store/{categoryId}', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/update/{product_id}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/destroy/{product_id}', [ProductController::class, 'destroy'])->name('products.destroy');

        Route::get('/price/attributes', [
            ProductController::class,
            'getPriceAttributes',
        ])->name('price.attributes');

        Route::get('/customers', [
            CustomerController::class,
            'index',
        ])->name('customers');
        Route::get('/customers/{customer}/orders', [
            CustomerController::class,
            'getCustomerOrders',
        ])->name('customers.orders');
        Route::get('/customers/{customer}/carts', [
            CustomerController::class,
            'getCustomerCarts',
        ])->name('customers.carts');

        Route::get('/orders', [CustomersOrdersController::class, 'index'])->name(
            'orders',
        );
        Route::get('/orders/{customer}', [
            CustomersOrdersController::class,
            'getCustomerOrders',
        ])->name('orders.customer');
        Route::get('/orders/{order}/details', [CustomersOrdersController::class, 'getOrderDetails'])->name('orders.details');

        Route::get('/media/{sort_column?}/{order?}/{search_term?}', [
            MediaController::class,
            'index',
        ])->name('media');

        Route::post('/media', [MediaController::class, 'store'])->name('media.store');
        Route::get('/media/{media}/edit', [MediaController::class, 'edit'])->name('media.edit');
        Route::put('/media/{media}', [MediaController::class, 'update'])->name('media.update');
        Route::delete('/media/{media}', [MediaController::class, 'destroy'])->name('media.destroy');

        Route::get('/users', [UserController::class, 'index'])->name('users');

        Route::get('/settings', function () {
            return Inertia::render('dashboard/settings/index');
        })->name('settings');
    });
