<?php

namespace App\Http\Controllers;

use App\Models\ContactUs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactUsController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('contact-us/index', [
            'success' => $request->session()->get('success'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        ContactUs::create($validated);

        return to_route('contact-us')->with('success', 'We will get back to you as soon as possible.');
    }
}
