import React, { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth'; // Assuming you have a hook for auth status
import useCheckoutStore from '@/zustand/checkoutStore';
import { User } from '@/types';
import { Address, User as UserType } from '@/types/model-types';
import { Checkout } from '@/types';

import classes from './customer-info.module.css'; // Assuming you have some CSS modules for styling
import { router, useForm } from '@inertiajs/react';
import clsx from 'clsx';

// A potential new component for handling the address form itself
// import AddressForm from './address-form';
import AddressForm from './address-form';
import { Button } from '@/components/ui/button';
import { AddressDialog } from './address-dialog';

type CustomerData = (UserType & { addresses: Address[] }) | null;

const CustomerInfoStep = ({ customer }: { customer: CustomerData }) => {
    const { user, isAuthenticated } = useAuth(); // Your auth hook
    const {
        checkout,
        billingSameAsShipping,
        setBillingSameAsShipping,
        setCheckout,
    } = useCheckoutStore();

    // Use local state to manage addresses for immediate UI updates
    const [localAddresses, setLocalAddresses] = useState<Address[]>(
        customer?.addresses || [],
    );

    // State to control the visibility of each address form independently
    const [showShippingForm, setShowShippingForm] = useState(false);
    const [showBillingForm, setShowBillingForm] = useState(false);
    const [dialogAddress, setDialogAddress] = useState<Address | 'new' | null>(
        null,
    );

    const { delete: destroy, processing: deleting } = useForm();

    useEffect(() => {
        const addresses = customer?.addresses || [];
        setLocalAddresses(addresses);

        // Determine if shipping or billing addresses are missing
        const hasShippingAddress = addresses.some((addr) => addr.default);
        const hasBillingAddress = addresses.some((addr) => addr.billing);

        setShowShippingForm(!hasShippingAddress);
        setShowBillingForm(!hasBillingAddress);

        // Only set the initial state from the checkout object when it's first loaded.
        if (
            checkout &&
            checkout.billing_same_as_shipping !== billingSameAsShipping
        ) {
            setBillingSameAsShipping(checkout.billing_same_as_shipping);
        }
    }, [customer, checkout]); // Removed setBillingSameAsShipping from dependencies

    // State to manage the flow for non-authenticated users
    const [email, setEmail] = useState('');
    const [view, setView] = useState<
        'initial' | 'login' | 'register' | 'guest'
    >('initial');

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

    const handleDelete = (addressId: number) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            destroy(route('address.destroy', addressId), {
                preserveScroll: true,
            });
        }
    };

    const handleBillingSameAsShippingChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const isChecked = e.target.checked;
        setBillingSameAsShipping(isChecked);

        if (checkout) {
            router.patch(
                route('checkout.update', checkout.id),
                {
                    ...checkout, // send existing data
                    billing_same_as_shipping: isChecked,
                },
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        setCheckout(page.props.checkout as Checkout);
                    },
                },
            );
        }
    };

    if (isAuthenticated && customer) {
        const hasShippingAddress = localAddresses.some((addr) => addr.default);
        const hasBillingAddress = localAddresses.some((addr) => addr.billing);

        // --- VIEW FOR LOGGED-IN USER ---
        return (
            <>
                <h2 className="text-2xl font-bold">
                    Welcome back,{' '}
                    {customer.first_name + ' ' + customer.last_name}!
                </h2>
                <p className="mt-2 text-gray-600">
                    Please confirm your details below.
                </p>

                {/* Example of displaying addresses */}
                <div className="mt-4 rounded border p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold">Your Addresses:</h3>
                        <Button
                            variant="outline"
                            onClick={() => setDialogAddress('new')}
                        >
                            Add New Address
                        </Button>
                    </div>
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
                                    <div className="mt-4 flex justify-end gap-2 border-t pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setDialogAddress(address)
                                            }
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(address.id)
                                            }
                                            disabled={deleting}
                                        >
                                            Delete
                                        </Button>
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

                <AddressDialog
                    address={dialogAddress}
                    isOpen={dialogAddress !== null}
                    onClose={() => setDialogAddress(null)}
                />

                {/* Address Forms based on pickup/delivery */}
                {checkout?.is_pickup && showBillingForm ? (
                    <div>
                        <h3 className="mt-6 text-xl font-semibold">
                            Billing Information
                        </h3>
                        <AddressForm
                            type="billing"
                            user={user}
                            onSuccess={() => setShowBillingForm(false)}
                        />
                    </div>
                ) : null}

                {checkout?.is_delivery ? (
                    <>
                        {showShippingForm && (
                            <div>
                                <h3 className="mt-6 text-xl font-semibold">
                                    Shipping Address
                                </h3>
                                <AddressForm
                                    type="shipping"
                                    user={user}
                                    billingSameAsShipping={
                                        billingSameAsShipping
                                    }
                                    onSuccess={() => setShowShippingForm(false)}
                                />
                            </div>
                        )}

                        {/* Only show checkbox if one or both addresses are missing */}
                        {(!hasShippingAddress || !hasBillingAddress) && (
                            <div className="mt-4 flex items-center">
                                <input
                                    id="billing-same-as-shipping"
                                    type="checkbox"
                                    checked={billingSameAsShipping}
                                    onChange={handleBillingSameAsShippingChange}
                                    className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="billing-same-as-shipping">
                                    Billing address is the same as shipping
                                </label>
                            </div>
                        )}

                        {!billingSameAsShipping && showBillingForm && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold">
                                    Billing Address
                                </h3>
                                <AddressForm
                                    type="billing"
                                    user={user}
                                    onSuccess={() => setShowBillingForm(false)}
                                />
                            </div>
                        )}
                    </>
                ) : null}
            </>
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
