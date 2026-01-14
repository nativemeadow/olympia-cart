<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// You can add middleware here to protect all dashboard routes,
// for example: ->middleware(['auth', 'can:access dashboard'])
Route::prefix('dashboard')->group(function () {
    Route::get('/', function () {
        return Inertia::render('dashboard/index');
    })->name('dashboard');

    Route::get('/categories', [DashboardController::class, 'categories'])->name(
        'dashboard.categories',
    );

    Route::get('/products', [DashboardController::class, 'products'])->name(
        'dashboard.products',
    );

    // Route::get('/products', function () {
    //     return Inertia::render('dashboard/products/index');
    // })->name('dashboard.products');

    Route::get('/orders', function () {
        return Inertia::render('dashboard/orders/index');
    })->name('dashboard.orders');

    Route::get('/customers', function () {
        return Inertia::render('dashboard/customers/index');
    })->name('dashboard.customers');

    Route::get('/users', function () {
        return Inertia::render('dashboard/users/index');
    })->name('dashboard.users');

    Route::get('/settings', function () {
        return Inertia::render('dashboard/settings/index');
    })->name('dashboard.settings');
});
