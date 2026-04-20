<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
//se Spatie\Permission\Models\Role;
use App\Models\Role;
use App\Models\Permission;
//use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'view dashboard',
            'view products',
            'create products',
            'update products',
            'delete products',
            'view categories',
            'create categories',
            'update categories',
            'delete categories',
            'view media',
            'create media',
            'update media',
            'delete media',
            'view customers',
            'create customers',
            'update customers',
            'delete customers',
            'view orders',
            'update orders',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign existing permissions
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(Permission::all());

        // you can add other roles here
    }
}
