<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Inertia\Inertia;
use Illuminate\Http\Request;

class RolesController extends Controller
{
    //
    public function index(Request $request)
    {
        // all roles and associated permissions per role
        $roles = Role::with('permissions')->get();

        return Inertia::render('dashboard/roles/index', [
            'roles' => $roles
        ]);
    }
}
