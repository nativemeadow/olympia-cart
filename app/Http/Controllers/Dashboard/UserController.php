<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // get all users
    public function index(Request $request)
    {
        $users = User::when($request->input('search'), function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query
                    ->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
        })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(10)
            ->withQueryString();

        return inertia('dashboard/users/index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }
}
