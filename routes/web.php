<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});


// Public API route for top-level categories
use App\Http\Controllers\CategoryController;

Route::get('categories/top-level', [CategoryController::class, 'topLevelCategories']);

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
