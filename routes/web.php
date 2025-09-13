<?php

use Illuminate\Support\Facades\Route;
// Public API route for categories
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactUsController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');

Route::get('/categories/{categorySlug}', [CategoryController::class, 'show'])->where('categorySlug', '.*')->name('categories.show');

Route::inertia('/resources', 'resources/index')->name('resources');
Route::inertia('/sustainability', 'sustainability/index')->name('sustainability');
Route::inertia('/faq', 'faq/index')->name('faq');
Route::inertia('/services', 'services/index')->name('services');

Route::get('/contact-us', [ContactUsController::class, 'index'])->name('contact-us');
Route::post('/contact-us', [ContactUsController::class, 'store'])->name('contact-us.store');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
