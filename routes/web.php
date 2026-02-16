<?php

use Illuminate\Support\Facades\Route;
// Public API route for categories
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ContactUsController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CartItemController;
use App\Http\Controllers\SearchIndexController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CheckoutStepsController;
use \App\Http\Controllers\Auth\RegisteredUserController;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// The homepage shows the category index.
Route::get('/', [CategoryController::class, 'index'])->name('home');

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
// used for starting checkout from cart -- do not remove
Route::get('/checkout/create', [App\Http\Controllers\CheckoutController::class, 'create'])->name('checkout.create');
Route::post('/checkout', [App\Http\Controllers\CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/checkout/{id}', [App\Http\Controllers\CheckoutController::class, 'show'])->name('checkout.show');
// used for editing checkout information -- do not remove
Route::patch('/checkout/{id}', [App\Http\Controllers\CheckoutController::class, 'update'])->name('checkout.update');
Route::patch('/checkout/{id}/status', [App\Http\Controllers\CheckoutController::class, 'updateStatus'])->name('checkout.updateStatus');
Route::patch('checkout/{id}/customerId', [App\Http\Controllers\CheckoutController::class, 'updateCustomerId'])->name('checkout.updateCustomerId');

Route::post('/payment/process', [App\Http\Controllers\PaymentController::class, 'processPayment'])->name('payment.process');

Route::post('/order/store', [App\Http\Controllers\OrderController::class, 'store'])->name('order.store');
Route::put('/order/{id}/update', [App\Http\Controllers\OrderController::class, 'update'])->name('order.update');
Route::post('payment/store', [PaymentController::class, 'store'])->name('payment.store');
Route::get('/order/confirmation', [App\Http\Controllers\OrderController::class, 'confirmation'])->name('order.confirmation');


// New Inertia-based Multi-Step Checkout Flow
Route::prefix('checkout-cart')->name('checkout-cart.')->middleware('checkout.valid')->group(function () {
    Route::get('/', [CheckoutStepsController::class, 'showCartCheckout'])->name('index');
    Route::patch('/step-one/{id}', [CheckoutStepsController::class, 'processStepOne'])->name('processStepOne');
    Route::patch('/step-two', [CheckoutStepsController::class, 'processStepTwo'])->name('processStepTwo');
    Route::post('/step-three', [CheckoutStepsController::class, 'processStepThree'])->name('step-three');
    Route::post('/payment', [CheckoutStepsController::class, 'processPayment'])->name('payment');
    Route::get('/step-five', [CheckoutStepsController::class, 'processStepFive'])->name('step-five');
    Route::post('checkout-address', [CheckoutStepsController::class, 'storeCheckoutAddress'])->name('checkout.address.store');
    Route::post('checkout-address-dialog', [CheckoutStepsController::class, 'storeDialogAddress'])->name('checkout.address.dialog.store');
    Route::patch('checkout-address/{address}', [CheckoutStepsController::class, 'updateCheckoutAddress'])->name('checkout.address.update');
    Route::delete('checkout-address/{address}', [CheckoutStepsController::class, 'deleteCheckoutAddress'])->name('checkout.customer.address.destroy');
    Route::put('checkout-address/{address}/set-default', [CheckoutStepsController::class, 'setDefaultAddress'])->name('checkout.address.setDefault');
    Route::post('set-billing-from-shipping', [CheckoutStepsController::class, 'setBillingFromShipping'])->name('checkout.setBillingFromShipping');
    Route::post('guest', [RegisteredUserController::class, 'checkoutGuestStore'])->name('guest.store');
});
// clear guest session after order confirmation is outside of the checkout-cart middleware group 
// so it can be accessed after checkout is complete
Route::post('/clear-guest-session', [CheckoutStepsController::class, 'clearGuestSession'])->name('clearGuestSession');

Route::inertia('/session', 'session/index')->name('session.index');


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/dashboard.php';
