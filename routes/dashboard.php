<?php

use App\Http\Controllers\Dashboard\CategoryController;
use App\Http\Controllers\Dashboard\MediaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CustomersController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('dashboard')
    ->name('dashboard.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('index');

        Route::get('/categories', [
            DashboardController::class,
            'categories',
        ])->name('categories.index');

        Route::resource('categories', CategoryController::class)->except([
            'index',
            'create',
            'show',
            'edit',
        ]);

        Route::get('/products', [
            DashboardController::class,
            'products',
        ])->name('products');

        Route::get('/customers', [CustomersController::class, 'getAll'])->name(
            'customers',
        );

        Route::get('/orders', [OrderController::class, 'getAll'])->name(
            'orders',
        );

        Route::get('/media/{sort_column?}/{order?}/{search_term?}', [MediaController::class, 'index'])->name('media');

        Route::post('/media', [MediaController::class, 'store'])->name('media.store');
        Route::get('/media/{media}/edit', [MediaController::class, 'edit'])->name('media.edit');
        Route::put('/media/{media}', [MediaController::class, 'update'])->name('media.update');
        Route::delete('/media/{media}', [MediaController::class, 'destroy'])->name('media.destroy');


        Route::get('/users', function () {
            return Inertia::render('dashboard/users/index');
        })->name('users');

        Route::get('/settings', function () {
            return Inertia::render('dashboard/settings/index');
        })->name('settings');
    });
