<?php

use App\Http\Controllers\Settings\AddressController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\UserProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    // The old GET routes are no longer needed for page rendering
    // Route::redirect('settings', '/settings/profile');
    // Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    // Route::get('settings/address', [AddressController::class, 'index'])->name('address.index');
    // Route::get('settings/orders', [OrderController::class, 'index'])->name('orders.index');
    // Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    // Route::get('settings/appearance', function () { ... })->name('appearance.index');

    // The main entry point for all settings
    Route::get('user-profile', [UserProfileController::class, 'show'])
        ->name('user-profile.show');

    // Keep all the action routes for forms
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('settings/address', [AddressController::class, 'store'])->name('address.store');
    Route::patch('settings/address/{address}', [AddressController::class, 'update'])->name('address.update');
    Route::delete('settings/address/{address}', [AddressController::class, 'destroy'])->name('address.destroy');
    Route::put('settings/address/{address:id}/set-default', [AddressController::class, 'setDefault'])->name('address.setDefault')->scopeBindings();

    Route::get('settings/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('settings/address', [AddressController::class, 'index'])->name('address.index');

    Route::get('settings/appearance', function () {
        return Inertia::render('Settings/Appearance');
    })->name('appearance.index');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');
});
