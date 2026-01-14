<?php

namespace App\Http\Controllers\Settings;

use App\Http\Requests\Settings\AddressRequest;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\ManagesCustomer;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AddressController extends Controller
{
    use AuthorizesRequests;
    use ManagesCustomer;

    public function index(Request $request)
    {
        $user = $request->user();
        $customer = $user->customer;

        return Inertia::render('settings/address', [
            'addresses' => $customer ? $customer->addresses()->get() : collect(),
        ]);
    }

    public function store(AddressRequest $request)
    {
        $validated = $request->validated();

        $customer = $this->getCurrentCustomer();

        if (!$customer) {
            // This should theoretically not happen for a logged-in user adding an address,
            // but it's good practice to handle it.
            return back()->with('error', 'Could not find or create customer.');
        }

        // If setting a new billing address, unset other billing addresses.
        if ($validated['billing']) {
            $customer->addresses()->where('billing', true)->update(['billing' => false]);
        }

        // If setting a new default shipping address, unset other default addresses.
        if ($validated['default']) {
            $customer->addresses()->where('default', true)->update(['default' => false]);
        }

        $customer->addresses()->create($validated);

        return back()->with('success', 'Address added successfully.');
    }

    public function update(AddressRequest $request, Address $address)
    {
        $this->authorize('update', $address);

        $validated = $request->validated();
        $user = $request->user();
        $customer = $user->customer;

        // If setting this as the billing address, unset others.
        if ($validated['billing']) {
            $customer->addresses()->where('billing', true)->where('id', '!=', $address->id)->update(['billing' => false]);
        }

        // If setting this as the default shipping address, unset others.
        if ($validated['default']) {
            $customer->addresses()->where('default', true)->where('id', '!=', $address->id)->update(['default' => false]);
        }

        $address->update($validated);

        return back()->with('success', 'Address updated successfully.');
    }

    public function destroy(Address $address)
    {
        $this->authorize('delete', $address);

        $address->delete();

        return back()->with('success', 'Address removed successfully.');
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
            'state' => ['required', 'boolean'],
        ]);

        $typeColumn = $validated['type'] === 'shipping' ? 'default' : 'billing';
        $isBeingSet = $validated['state'];
        $user = $request->user();

        DB::transaction(function () use ($user, $address, $typeColumn, $isBeingSet) {
            // If a checkbox is checked, we first ensure no other address has this flag.
            if ($isBeingSet) {
                // 1. Unset the current default for this type for all of the user's addresses.
                $user->addresses()->where('id', '!=', $address->id)->update([$typeColumn => false]);
            }

            // 2. Set the state on the specified address.
            $address->update([$typeColumn => $isBeingSet]);
        });

        return back()->with('success', 'Default address updated successfully.');
    }
}
