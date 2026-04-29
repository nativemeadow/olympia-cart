<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // get all users
    public function index(Request $request)
    {
        $users = User::with('roles') // Eager-load the roles relationship
            ->when($request->input('search'), function ($query, $search) {
                $query
                    ->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(10)
            ->withQueryString();

        $roles = Role::all();

        return inertia('dashboard/users/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(Request $request)
    {
        $user = User::with('roles.permissions')->findOrFail($request->route('user_id'));

        return inertia('dashboard/users/show', [
            'user' => $user,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        $user = User::create($validated);

        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return redirect()->route('dashboard.users.show', $user->id)->with('success', 'User created successfully.');
    }

    public function update(Request $request)
    {
        $user = User::findOrFail($request->route('user_id'));

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        $user->update($validated);

        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return redirect()->route('dashboard.users.show', $user->id)->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request)
    {
        $user = User::findOrFail($request->route('user_id'));

        $user->delete();

        return redirect()->route('dashboard.users')->with('success', 'User deleted successfully.');
    }
}
