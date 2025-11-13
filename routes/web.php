<?php

use Illuminate\Support\Facades\Route;
// Public API route for categories
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ContactUsController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\SearchIndexController;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// The homepage shows the category index.
Route::get('/', [CategoryController::class, 'index'])->name('home');

use App\Http\Controllers\CartItemController;

// ... other routes

Route::patch('/cart/items/{cartItem}', [CartItemController::class, 'update'])->name('cart.items.update');
Route::delete('/cart/items/{cartItem}', [CartItemController::class, 'destroy'])->name('cart.items.destroy');

Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');

Route::get('/categories/products/{categorySlug}/{slug}', [ProductController::class, 'show'])->where('categorySlug', '.*')->name('products.show');
Route::get('/categories/{categorySlug}', [CategoryController::class, 'show'])->where('categorySlug', '.*')->name('categories.show');


Route::post('/cart/items', [CartController::class, 'addItem'])->name('cart.items.add');

Route::get('/shopping-cart', [CartController::class, 'index'])->name('shopping-cart.show');

Route::inertia('/resources', 'resources/index')->name('resources');
Route::inertia('/sustainability', 'sustainability/index')->name('sustainability');
Route::inertia('/faq', 'faq/index')->name('faq');
Route::inertia('/services', 'services/index')->name('services');

Route::get('/contact-us', [ContactUsController::class, 'index'])->name('contact-us');
Route::post('/contact-us', [ContactUsController::class, 'store'])->name('contact-us.store');

Route::get('/search/{searchTerm?}', [SearchIndexController::class, 'index'])->name('search.index');

// Existing Checkout Routes (preserved)
Route::get('/checkout', [App\Http\Controllers\CheckoutController::class, 'index'])->name('checkout.index');
Route::get('/checkout/create', [App\Http\Controllers\CheckoutController::class, 'create'])->name('checkout.create');
Route::post('/checkout', [App\Http\Controllers\CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/checkout/{id}', [App\Http\Controllers\CheckoutController::class, 'show'])->name('checkout.show');
Route::patch('/checkout/{id}', [App\Http\Controllers\CheckoutController::class, 'update'])->name('checkout.update');

// New Inertia-based Multi-Step Checkout Flow
// Note: The 'auth' middleware has been removed to allow guest checkout.
Route::prefix('checkout-cart')->name('checkout-cart.')->group(function () {
    Route::get('/', [App\Http\Controllers\CheckoutStepsController::class, 'showCartCheckout'])->name('index');
    Route::patch('/step-one/{id}', [App\Http\Controllers\CheckoutStepsController::class, 'processStepOne'])->name('processStepOne');
    Route::post('/step-two', [App\Http\Controllers\CheckoutStepsController::class, 'processStepTwo'])->name('step-two');
    Route::post('/step-three', [App\Http\Controllers\CheckoutStepsController::class, 'processStepThree'])->name('step-three');
    Route::post('/payment', [App\Http\Controllers\CheckoutStepsController::class, 'processPayment'])->name('payment');
    Route::post('/step-five', [App\Http\Controllers\CheckoutStepsController::class, 'processStepFive'])->name('step-five');
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
