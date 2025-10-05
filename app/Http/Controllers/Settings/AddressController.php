<?php

namespace App\Http\Controllers\Settings;

use App\Http\Requests\Settings\AddressRequest;
use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AddressController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        return Inertia::render('settings/address', [
            'addresses' => $request->user()->addresses()->get(),
        ]);
    }

    public function store(AddressRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        // If setting a new billing address, unset other billing addresses.
        if ($validated['billing']) {
            $user->addresses()->where('billing', true)->update(['billing' => false]);
        }

        $user->addresses()->create($validated);

        return redirect()->route('address.index')->with('success', 'Address added successfully.');
    }

    public function update(AddressRequest $request, Address $address)
    {
        $validated = $request->validated();
        $user = $request->user();

        // If setting this as the billing address, unset others.
        if ($validated['billing']) {
            $user->addresses()->where('billing', true)->where('id', '!=', $address->id)->update(['billing' => false]);
        }

        $address->update($validated);

        return redirect()->route('address.index')->with('success', 'Address updated successfully.');
    }

    public function destroy(Address $address)
    {
        $this->authorize('delete', $address);

        $address->delete();

        return redirect()->route('address.index')->with('success', 'Address removed successfully.');
    }
}
