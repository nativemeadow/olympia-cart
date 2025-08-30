<?php

use Illuminate\Support\Facades\Route;
// Public API route for categories
use App\Http\Controllers\CategoryController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('categories/top-level', [CategoryController::class, 'topLevelCategories']);

Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');

Route::get('/categories/{slug}', [CategoryController::class, 'show'])->name('categories.show');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
