<?php

namespace App\Http\Controllers\Settings;

use App\Http\Requests\Settings\AddressRequest;
use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
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

        // If setting a new default shipping address, unset other default addresses.
        if ($validated['default']) {
            $user->addresses()->where('default', true)->update(['default' => false]);
        }

        $user->addresses()->create($validated);

        return redirect()->route('address.index')->with('success', 'Address added successfully.');
    }

    public function update(AddressRequest $request, Address $address)
    {
        $this->authorize('update', $address);

        $validated = $request->validated();
        $user = $request->user();

        // If setting this as the billing address, unset others.
        if ($validated['billing']) {
            $user->addresses()->where('billing', true)->where('id', '!=', $address->id)->update(['billing' => false]);
        }

        // If setting this as the default shipping address, unset others.
        if ($validated['default']) {
            $user->addresses()->where('default', true)->where('id', '!=', $address->id)->update(['default' => false]);
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

    /**
     * Set a given address as the default for a given type (shipping or billing).
     *
     * @param Request $request
     * @param Address $address
     * @return RedirectResponse
     */
    public function setDefault(Request $request, Address $address): RedirectResponse
    {
        // Ensure the user is authorized to update this address
        $this->authorize('update', $address);

        $validated = $request->validate([
            'type' => ['required', Rule::in(['shipping', 'billing'])],
        ]);

        $typeColumn = $validated['type'] === 'shipping' ? 'default' : 'billing';
        $user = $request->user();

        DB::transaction(function () use ($user, $address, $typeColumn) {
            // 1. Unset the current default for this type for all of the user's addresses.
            $user->addresses()->update([$typeColumn => false]);

            // 2. Set the new default on the specified address.
            $address->update([$typeColumn => true]);
        });

        return back()->with('success', 'Default address updated successfully.');
    }
}
