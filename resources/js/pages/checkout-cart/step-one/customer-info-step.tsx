import React, { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth'; // Assuming you have a hook for auth status
import useCheckoutStore from '@/zustand/checkoutStore';
import { User } from '@/types';
import { Address } from '@/types/model-types';

import classes from './customer-info.module.css'; // Assuming you have some CSS modules for styling
import { router } from '@inertiajs/react';
import clsx from 'clsx';

// A potential new component for handling the address form itself
// import AddressForm from './address-form';

type CustomerData = (User & { addresses: Address[] }) | null;

const CustomerInfoStep = ({ customer }: { customer: CustomerData }) => {
    const { user, isAuthenticated } = useAuth(); // Your auth hook
    const { checkout /*, setBillingAddress, setShippingAddress */ } =
        useCheckoutStore();

    // Use local state to manage addresses for immediate UI updates
    const [localAddresses, setLocalAddresses] = useState<Address[]>(
        customer?.addresses || [],
    );

    useEffect(() => setLocalAddresses(customer?.addresses || []), [customer]);

    // State to manage the flow for non-authenticated users
    const [email, setEmail] = useState('');
    const [view, setView] = useState<
        'initial' | 'login' | 'register' | 'guest'
    >('initial');

    const handleBillingAddressUpdate = (address: any) => {
        // This function is now handled by handleSetDefault
    };

    const handleDeliveryAddressUpdate = (address: any) => {
        // This function is now handled by handleSetDefault
    };

    const handleEmailCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Checking email:', email);
        // API call to check if email exists in your users table
        // const response = await axios.post('/api/checkout/check-email', { email });

        // Based on the response, update the view
        // if (response.data.exists) {
        //     setView('login');
        // } else {
        //     setView('guest'); // Default to guest, with an option to switch to register
        // }
    };

    const handleSetDefault = (
        addressId: number,
        type: 'shipping' | 'billing',
    ) => {
        // Optimistically update the UI
        const updatedAddresses = localAddresses.map((addr) => {
            const key = type === 'shipping' ? 'default' : 'billing';
            if (addr.id === addressId) {
                return { ...addr, [key]: true };
            }
            return { ...addr, [key]: false };
        });
        setLocalAddresses(updatedAddresses);

        // Make the API call to persist the change
        router.put(
            route('address.setDefault', { address: addressId }),
            { type },
            {
                preserveScroll: true,
                onError: () => {
                    // On error, revert to the original state from props
                    setLocalAddresses(customer?.addresses || []);
                },
            },
        );
    };

    if (isAuthenticated && customer) {
        // --- VIEW FOR LOGGED-IN USER ---
        return (
            <div>
                <h2 className="text-2xl font-bold">
                    Welcome back,{' '}
                    {customer.first_name + ' ' + customer.last_name}!
                </h2>
                <p className="mt-2 text-gray-600">
                    Please confirm your details below.
                </p>

                {/* Example of displaying addresses */}
                <div className="mt-4 rounded border p-4">
                    <h3 className="font-semibold">Your Addresses:</h3>
                    {localAddresses.length > 0 ? (
                        <div className={classes.address_grid}>
                            {localAddresses.map((address) => (
                                <div
                                    key={address.id}
                                    className={clsx(
                                        classes.address_card,
                                        address.default && classes.is_shipping,
                                        address.billing && classes.is_billing,
                                        address.default &&
                                            address.billing &&
                                            classes.is_both,
                                    )}
                                >
                                    <div className="flex-grow">
                                        <p>{address.street1}</p>
                                        {address.street2 && (
                                            <p>{address.street2}</p>
                                        )}
                                        <p>
                                            {address.city}, {address.state}{' '}
                                            {address.zip}
                                        </p>
                                    </div>
                                    <div className="mt-4 space-y-2 border-t pt-2">
                                        <label className="flex items-center text-sm">
                                            <input
                                                type="checkbox"
                                                className="mr-2"
                                                checked={!!address.default}
                                                onChange={() =>
                                                    handleSetDefault(
                                                        address.id,
                                                        'shipping',
                                                    )
                                                }
                                            />
                                            Default Shipping
                                        </label>
                                        <label className="flex items-center text-sm">
                                            <input
                                                type="checkbox"
                                                className="mr-2"
                                                checked={!!address.billing}
                                                onChange={() =>
                                                    handleSetDefault(
                                                        address.id,
                                                        'billing',
                                                    )
                                                }
                                            />
                                            Default Billing
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                            You have no saved addresses.
                        </p>
                    )}
                </div>

                {/* Address Forms based on pickup/delivery */}
                {checkout?.is_pickup ? (
                    <div>
                        <h3 className="mt-6 text-xl font-semibold">
                            Billing Information
                        </h3>
                        {/* <AddressForm type="billing" user={user} onUpdate={handleBillingAddressUpdate} /> */}
                    </div>
                ) : (
                    <div>
                        <h3 className="mt-6 text-xl font-semibold">
                            Shipping Address
                        </h3>
                        {/* <AddressForm type="shipping" user={user} onUpdate={handleDeliveryAddressUpdate} /> */}

                        {/* Logic for "same as" checkbox would go here */}
                        <h3 className="mt-6 text-xl font-semibold">
                            Billing Address
                        </h3>
                        {/* <AddressForm type="billing" user={user} onUpdate={handleBillingAddressUpdate} /> */}
                    </div>
                )}
            </div>
        );
    }

    // --- VIEWS FOR NON-LOGGED-IN USER ---
    return (
        <div>
            <h2 className="text-2xl font-bold">Customer Information</h2>

            {/* 1. Initial Email Input */}
            {view === 'initial' && (
                <form onSubmit={handleEmailCheck} className="mt-4">
                    <label htmlFor="email" className="block font-medium">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded border-gray-300"
                        required
                    />
                    <button
                        type="submit"
                        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
                    >
                        Continue
                    </button>
                </form>
            )}

            {/* 2. Login prompt if user exists */}
            {view === 'login' && (
                <div>
                    <p>Welcome back! Please log in to continue.</p>
                    {/* Your Login Form Component would go here */}
                </div>
            )}

            {/* 3. Guest/Register form if user is new */}
            {(view === 'guest' || view === 'register') && (
                <div className="mt-6">
                    <div className="flex items-center gap-6 border-b pb-4">
                        <button
                            onClick={() => setView('guest')}
                            className={`border-b-2 pb-1 text-lg ${view === 'guest' ? 'border-yellow-700 font-semibold' : 'border-transparent'}`}
                        >
                            Checkout as Guest
                        </button>
                        <button
                            onClick={() => setView('register')}
                            className={`border-b-2 pb-1 text-lg ${view === 'register' ? 'border-yellow-700 font-semibold' : 'border-transparent'}`}
                        >
                            Create an Account
                        </button>
                    </div>

                    <div className="mt-4">
                        {/* Basic form fields for name, etc. would go here */}
                        {view === 'register' && (
                            <div className="mt-4">
                                <label className="block font-medium">
                                    Create a Password
                                </label>
                                <input
                                    type="password"
                                    className="mt-1 w-full rounded border-gray-300"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Save your information for next time.
                                </p>
                            </div>
                        )}
                        {/* Address forms would follow here */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerInfoStep;
