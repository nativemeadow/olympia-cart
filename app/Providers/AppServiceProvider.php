<?php

namespace App\Providers;

use App\Models\Address;
use App\Policies\AddressPolicy;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Use the file's hash as the version string to ensure clients get the latest assets.
        Inertia::version(function () {
            return md5_file(public_path('build/manifest.json'));
        });
    }

    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Address::class => AddressPolicy::class,
    ];
}
