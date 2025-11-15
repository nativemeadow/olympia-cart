import React, { useState, useEffect, FormEventHandler } from 'react';
import useAuth from '@/hooks/useAuth';
import useCheckoutStore from '@/zustand/checkoutStore';
import useCheckoutStepsStore from '@/zustand/checkoutStepsStore';
import { User } from '@/types';
import { Address, CustomerData } from '@/types/model-types';
import { Checkout } from '@/types';

import classes from './customer-info.module.css'; // Assuming you have some CSS modules for styling
import { router, useForm } from '@inertiajs/react';
import clsx from 'clsx';
import AddressForm from './address-form';
import Register from './register';
import { Button } from '@/components/ui/button';
import { AddressDialog } from './address-dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputError } from '@/components/ui/input-error';
import axios from 'axios';

//type CustomerData = (UserType & { addresses: Address[] }) | null;

const CustomerInfoStep = ({ customer }: { customer: CustomerData }) => {
    const { user, isAuthenticated } = useAuth(); // Your auth hook
    const {
        checkout,
        billingSameAsShipping,
        setBillingSameAsShipping,
        setCheckout,
    } = useCheckoutStore();
    const [isGuest, setIsGuest] = useState(false);

    console.log('CustomerInfoStep render - checkout:', checkout);

    const {
        currentStep,
        nextStep,
        previousStep,
        setCurrentStep,
        setStepCompleted,
        setStepCanProceed,
    } = useCheckoutStepsStore();

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

    const {
        data: loginData,
        setData: setLoginData,
        post: loginPost,
        processing: loginProcessing,
        errors: loginErrors,
        setError,
    } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleLogin: FormEventHandler = (e) => {
        e.preventDefault();
        // We use axios here to prevent Inertia's automatic redirect handling.
        axios
            .post(route('checkout.login'), loginData)
            .then(() => {
                // On success, we visit the current page to get the new props
                // for the authenticated user, which re-renders the component.
                router.visit(window.location.href, { preserveState: false });
            })
            .catch((error) => {
                // If the login fails (e.g., 422 validation error),
                // we can manually set the errors on the Inertia form hook.
                if (error.response && error.response.status === 422) {
                    setError(error.response.data.errors);
                }
            });
    };

    useEffect(() => {
        const addresses = customer?.addresses || [];
        setLocalAddresses(addresses);

        // Determine if shipping or billing addresses are missing
        const hasShippingAddress = addresses.some((addr) => addr.default);
        const hasBillingAddress = addresses.some((addr) => addr.billing);

        // The form visibility should be based on whether addresses exist for the customer.
        setShowShippingForm(!hasShippingAddress && !!checkout?.is_delivery);
        setShowBillingForm(!hasBillingAddress);
    }, [customer, checkout]);

    const handleSetDefault = (
        addressId: number,
        type: 'shipping' | 'billing',
        isChecked: boolean,
    ) => {
        // Optimistically update the UI
        const key = type === 'shipping' ? 'default' : 'billing';
        const updatedAddresses = localAddresses.map((addr) => {
            if (addr.id === addressId) {
                // Set the state of the toggled checkbox
                return { ...addr, [key]: isChecked };
            }
            // If we are setting a new default, unset it for all other addresses
            if (isChecked) {
                return { ...addr, [key]: false };
            }
            return addr;
        });
        setLocalAddresses(updatedAddresses);

        // Make the API call to persist the change
        router.put(
            route('address.setDefault', { address: addressId }),
            { type, state: isChecked },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    setCheckout(page.props.checkout as Checkout);
                    updateShippingBillingCheckout();
                },
                onError: () => {
                    // On error, revert to the original state from props
                    setLocalAddresses(customer?.addresses || []);
                },
            },
        );
    };

    const updateShippingBillingCheckout = () => {
        if (checkout) {
            const hasShippingAddress = localAddresses.some(
                (addr) => addr.default,
            );
            const hasBillingAddress = localAddresses.some(
                (addr) => addr.billing,
            );

            const updatedData: {
                delivery_address_id: number | null;
                billing_address_id: number | null;
            } = {
                delivery_address_id: null,
                billing_address_id: null,
            };

            if (hasShippingAddress) {
                const shippingAddress = localAddresses.find(
                    (addr) => addr.default,
                );
                updatedData.delivery_address_id = shippingAddress?.id || null;
            }

            if (hasBillingAddress) {
                const billingAddress = localAddresses.find(
                    (addr) => addr.billing,
                );
                updatedData.billing_address_id = billingAddress?.id || null;
            }

            router.patch(
                route('checkout-cart.processStepOne', checkout.id),
                updatedData,
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        setCheckout(page.props.checkout as Checkout);
                    },
                },
            );
        }
    };

    const handleDelete = (addressId: number) => {
        destroy(route('address.destroy', addressId), {
            preserveScroll: true,
        });
    };

    const handleBillingSameAsShippingChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const isChecked = e.target.checked;
        setBillingSameAsShipping(isChecked);

        // Only send the update if a checkout record exists AND
        // there is a default shipping address selected.
        // If no shipping address is selected, the backend would reject the request
        // because it can't set the billing address to a non-existent shipping address.
        const hasShippingAddress = localAddresses.some((addr) => addr.default);

        if (checkout && hasShippingAddress) {
            router.patch(
                route('checkout-cart.processStepOne', checkout.id),
                {
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

    const handleContinueToShipping = () => {
        if (checkout?.billing_address_id && checkout?.delivery_address_id) {
            const deliverPlusBilling = {
                delivery_address_id: checkout.delivery_address_id,
                billing_address_id: checkout.billing_same_as_shipping
                    ? checkout.delivery_address_id
                    : checkout.billing_address_id,
            };

            router.patch(
                route('checkout-cart.processStepOne', checkout.id),
                deliverPlusBilling,
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        setCheckout(page.props.checkout as Checkout);
                    },
                },
            );

            setStepCanProceed('customerInfo', true);
            setStepCompleted('customerInfo', true);
            nextStep();
        } else {
            // You might want to show an error message here
            alert(
                'Please ensure both shipping and billing addresses are set before continuing.',
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
                                        <p>{address.phone}</p>
                                    </div>
                                    <div className="mt-4 space-y-2 border-t pt-2">
                                        <label className="flex items-center text-sm">
                                            <input
                                                type="checkbox"
                                                className="mr-2"
                                                checked={!!address.default}
                                                onChange={(e) =>
                                                    handleSetDefault(
                                                        address.id,
                                                        'shipping',
                                                        e.target.checked,
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
                                                onChange={(e) =>
                                                    handleSetDefault(
                                                        address.id,
                                                        'billing',
                                                        e.target.checked,
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
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={deleting}
                                                >
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Are you sure?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be
                                                        undone. This will
                                                        permanently delete this
                                                        address.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() =>
                                                            handleDelete(
                                                                address.id,
                                                            )
                                                        }
                                                    >
                                                        Continue
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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

                        {checkout.delivery_address_id ||
                        checkout.billing_address_id ? (
                            <div className="mt-6 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                                <Button
                                    onClick={handleContinueToShipping}
                                    color="primary"
                                    className="h-12 w-full rounded bg-green-600 text-xl text-white sm:w-auto"
                                    // Ensure this button is prominent
                                >
                                    {checkout?.is_pickup
                                        ? 'Continue to Pickup Options'
                                        : 'Continue to Shipping Options'}
                                </Button>
                            </div>
                        ) : null}
                    </>
                ) : checkout?.is_pickup ? (
                    <div className="mt-6 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                        <Button
                            onClick={handleContinueToShipping}
                            color="primary"
                            className="h-12 w-full rounded bg-green-600 text-xl text-white sm:w-auto"
                            // Ensure this button is prominent
                        >
                            Continue to Pickup Options
                        </Button>
                    </div>
                ) : null}
            </>
        );
    }

    // --- VIEWS FOR NON-LOGGED-IN USER ---
    return (
        <div>
            <h2 className="mb-4 text-2xl font-bold">Customer Information</h2>

            <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue="item-2"
            >
                <AccordionItem value="item-1">
                    <AccordionTrigger>
                        Already have an account? Log In
                    </AccordionTrigger>
                    <AccordionContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    value={loginData.email}
                                    onChange={(e) =>
                                        setLoginData('email', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={loginErrors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="login-password">Password</Label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    value={loginData.password}
                                    onChange={(e) =>
                                        setLoginData('password', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={loginErrors.password} />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loginProcessing}
                            >
                                Log In
                            </Button>
                        </form>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>
                        Create an Account or Checkout as Guest
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="mb-4 text-sm text-gray-600">
                            Create an account to save your information for next
                            time, or continue as a guest.
                        </p>
                        {/* The registration and address forms will go here.
                            For now, this is a placeholder.
                            You would integrate your registration form and AddressForm components here.
                        */}
                        <div className="text-center">
                            <div className="mt-4 flex items-center justify-center">
                                <Input
                                    type="checkbox"
                                    name="isGuest"
                                    checked={isGuest}
                                    onChange={(e) =>
                                        setIsGuest(e.target.checked)
                                    }
                                    className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />

                                <Label htmlFor="isGuest">
                                    Continue without creating an account (as
                                    Guest)
                                </Label>
                            </div>
                            <div className="mt-6 text-left">
                                <h2 className="mt-4 mb-2 font-semibold">
                                    Login Information
                                </h2>
                                <Register isGuest={isGuest} />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default CustomerInfoStep;
