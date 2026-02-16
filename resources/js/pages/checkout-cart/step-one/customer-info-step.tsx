import React, { useState, useEffect, useRef, FormEventHandler } from 'react';
import useAuth from '@/hooks/useAuth';
import useCheckoutStore from '@/zustand/checkoutStore';
import useCheckoutStepsStore from '@/zustand/checkoutStepsStore';
import { Address, CustomerData } from '@/types/model-types';
import { Checkout } from '@/types';
import { formatPhoneNumber } from '@/utils/format-phone-number';

import classes from './customer-info.module.css'; // Assuming you have some CSS modules for styling
import { router, useForm, Link } from '@inertiajs/react';
import clsx from 'clsx';
import AddressForm, { AddressFormHandle } from './address-form';
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

    // Create refs for the address forms
    const shippingFormRef = useRef<AddressFormHandle>(null);
    const billingFormRef = useRef<AddressFormHandle>(null);

    const { nextStep, setStepCompleted, setStepCanProceed } =
        useCheckoutStepsStore();

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

    const { delete: destroy, processing: deleting } = useForm({});

    const {
        data: guestData,
        setData: setGuestData,
        post: guestPost,
        processing: guestProcessing,
        errors: guestErrors,
    } = useForm({
        first_name: '',
        last_name: '',
        email: '',
    });

    const handleGuestCheckout: FormEventHandler = (e) => {
        e.preventDefault();
        guestPost(route('checkout-cart.guest.store'), {
            onSuccess: () => {
                router.reload();
            },
        });
    };

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
        const key = type === 'shipping' ? 'default' : 'billing';

        // Optimistically update local addresses
        const updatedAddresses = localAddresses.map((addr) => {
            if (addr.id === addressId) {
                return { ...addr, [key]: isChecked };
            }
            if (isChecked) {
                return { ...addr, [key]: false };
            }
            return addr;
        });
        setLocalAddresses(updatedAddresses);

        // After optimistic update, check if default shipping and billing are the same
        const defaultShipping = updatedAddresses.find((a) => a.default);
        const defaultBilling = updatedAddresses.find((a) => a.billing);
        setBillingSameAsShipping(
            !!defaultShipping &&
                !!defaultBilling &&
                defaultShipping.id === defaultBilling.id,
        );

        // Make the API call to persist the change
        router.put(
            route('checkout-cart.checkout.address.setDefault', {
                address: addressId,
            }),
            { type, state: isChecked },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Re-sync with server state on success
                    const serverCheckout = page.props.checkout as Checkout;
                    const serverCustomer = page.props.customer as CustomerData;
                    setCheckout(serverCheckout);
                    if (serverCustomer?.addresses) {
                        setLocalAddresses(serverCustomer.addresses);
                        const newShipping = serverCustomer.addresses.find(
                            (a) => a.default,
                        );
                        const newBilling = serverCustomer.addresses.find(
                            (a) => a.billing,
                        );
                        setBillingSameAsShipping(
                            !!newShipping &&
                                !!newBilling &&
                                newShipping.id === newBilling.id,
                        );
                    }
                },
                onError: () => {
                    // On error, revert to the original state from props
                    setLocalAddresses(customer?.addresses || []);
                },
            },
        );
    };

    const handleDelete = (addressId: number) => {
        const routeName = isAuthenticated
            ? 'address.destroy'
            : 'checkout-cart.checkout.customer.address.destroy';
        destroy(route(routeName, { address: addressId }), {
            preserveScroll: true,
        });
    };

    const handleBillingSameAsShippingChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const isChecked = e.target.checked;
        setBillingSameAsShipping(isChecked);

        const defaultShippingAddress = localAddresses.find(
            (addr) => addr.default,
        );

        // If checking the box and a default shipping address exists,
        // set it as the billing address.
        if (isChecked && defaultShippingAddress) {
            handleSetDefault(defaultShippingAddress.id, 'billing', true);
        } else if (!isChecked) {
            // If unchecking, the user intends to select a different billing address.
            // We can find the current billing address and "uncheck" it.
            const currentBillingAddress = localAddresses.find(
                (addr) => addr.billing,
            );
            if (currentBillingAddress) {
                handleSetDefault(currentBillingAddress.id, 'billing', false);
            }
        }
    };

    const nextButtonLabel = () => {
        if (checkout?.billing_address_id && checkout?.delivery_address_id) {
            if (checkout.is_delivery) {
                return 'Continue to Shipping Options';
            }
        } else if (
            checkout?.billing_address_id &&
            !checkout?.delivery_address_id
        ) {
            if (checkout.is_pickup) {
                return 'Continue to Pickup Options';
            }
        }
        return 'Save Addresses';
    };

    const handleContinue = () => {
        if (!checkout) {
            alert('Checkout session not found. Please refresh and try again.');
            return;
        }

        const isDelivery = checkout.is_delivery;
        const isPickup = checkout.is_pickup;

        // Check if we can proceed without submitting new addresses
        const canProceedDirectly =
            (isPickup && checkout.billing_address_id) ||
            (isDelivery &&
                checkout.billing_address_id &&
                checkout.delivery_address_id);

        router.patch(route(`checkout.updateCustomerId`, checkout.id), {
            customer_id: customer?.id,
        });

        if (canProceedDirectly) {
            setStepCanProceed('customerInfo', true);
            setStepCompleted('customerInfo', true);
            nextStep();
            return;
        }

        // If we can't proceed directly, it means we need to collect address(es)
        const payload: any = {
            billing_same_as_shipping: billingSameAsShipping,
        };

        let shippingData = null;
        if (isDelivery && showShippingForm) {
            shippingData = shippingFormRef.current?.getFormData();
            if (shippingData && Object.values(shippingData).some((v) => v)) {
                payload.shipping_address = shippingData;
            }
        }

        let billingData = null;
        if (showBillingForm && !billingSameAsShipping) {
            billingData = billingFormRef.current?.getFormData();
            if (billingData && Object.values(billingData).some((v) => v)) {
                payload.billing_address = billingData;
            }
        }

        // If billing is same as shipping, we only need shipping data.
        // The backend will handle creating one address for both.
        if (billingSameAsShipping && shippingData) {
            payload.billing_address = shippingData;
        }

        // If it's pickup, we only care about the billing form.
        if (!isDelivery && showBillingForm) {
            billingData = billingFormRef.current?.getFormData();
            if (billingData && Object.values(billingData).some((v) => v)) {
                payload.billing_address = billingData;
            }
        }

        // Ensure we have at least one address to submit
        if (!payload.shipping_address && !payload.billing_address) {
            alert('Please fill out at least one address form to continue.');
            return;
        }

        const routeName = 'checkout-cart.checkout.address.store'; // Authenticated users also use this route for checkout addresses

        router.post(route(routeName), payload, {
            preserveScroll: true,
            onSuccess: (page) => {
                // After saving, the component re-renders with new props.
                // We need to use the *updated* checkout from the page props.
                const updatedCheckout = page.props.checkout as Checkout;

                const canProceedAfterSave =
                    (updatedCheckout.is_pickup &&
                        updatedCheckout.billing_address_id) ||
                    (updatedCheckout.is_delivery &&
                        updatedCheckout.billing_address_id &&
                        updatedCheckout.delivery_address_id);

                if (canProceedAfterSave) {
                    setStepCanProceed('customerInfo', true);
                    setStepCompleted('customerInfo', true);
                    nextStep();
                }
            },
            onError: (errors) => {
                console.error('Failed to save addresses:', errors);
                alert(
                    'There was an error saving your addresses. Please check the form and try again.',
                );
            },
        });
    };

    if (customer) {
        const hasShippingAddress = localAddresses.some((addr) => addr.default);
        const hasBillingAddress = localAddresses.some((addr) => addr.billing);

        // --- VIEW FOR LOGGED-IN USER ---
        return (
            <>
                <h2 className="text-2xl font-bold">
                    Welcome
                    {` ${customer.first_name} ${customer.last_name}`}!
                </h2>
                <p className="mt-2 text-gray-600">
                    Please confirm your details below.
                </p>
                {localAddresses.length > 0 && (
                    <div
                        id="addresses-section"
                        className="mt-4 rounded border p-4"
                    >
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
                                            address.default &&
                                                classes.is_shipping,
                                            address.billing &&
                                                classes.is_billing,
                                            address.default &&
                                                address.billing &&
                                                classes.is_both,
                                        )}
                                    >
                                        <div className="flex-grow">
                                            <p>{address.name}</p>
                                            <p>{address.street1}</p>
                                            {address.street2 && (
                                                <p>{address.street2}</p>
                                            )}
                                            <p>
                                                {address.city}, {address.state}{' '}
                                                {address.zip}
                                            </p>
                                            <p>
                                                {formatPhoneNumber(
                                                    address.phone,
                                                )}
                                            </p>
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
                                                            This action cannot
                                                            be undone. This will
                                                            permanently delete
                                                            this address.
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
                )}

                <AddressDialog
                    customer={customer}
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
                            ref={billingFormRef}
                            type="billing"
                            user={user}
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
                                    ref={shippingFormRef}
                                    type="shipping"
                                    user={user}
                                    billingSameAsShipping={
                                        billingSameAsShipping
                                    }
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
                                    ref={billingFormRef}
                                    type="billing"
                                    user={user}
                                />
                            </div>
                        )}

                        <div className="mt-6 flex w-full justify-between">
                            <Link
                                href={route('shopping-cart.show')}
                                as="button"
                                className="inline-flex h-12 w-full items-center justify-center rounded bg-green-600 px-4 py-2 text-xl font-medium text-white ring-offset-background transition-colors hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                            >
                                Back to My Cart
                            </Link>
                            <Button
                                onClick={handleContinue}
                                color="primary"
                                className="h-12 w-full rounded bg-green-600 text-xl text-white sm:w-auto"
                                // Ensure this button is prominent
                            >
                                {nextButtonLabel()}
                            </Button>
                        </div>
                    </>
                ) : checkout?.is_pickup ? (
                    <div className="mt-6 flex w-full justify-between">
                        <Link
                            href={route('shopping-cart.show')}
                            as="button"
                            className="inline-flex h-12 w-full items-center justify-center rounded border bg-transparent px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                        >
                            Back to My Cart
                        </Link>
                        <Button
                            onClick={handleContinue}
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
                        <div className="text-center">
                            <div className="mt-4 flex items-center justify-center">
                                <Input
                                    type="checkbox"
                                    name="isGuest"
                                    checked={isGuest}
                                    onChange={(e) =>
                                        setIsGuest(e.target.checked)
                                    }
                                    className={classes.guest_button}
                                />

                                <Label htmlFor="isGuest">
                                    Continue without creating an account (as
                                    Guest)
                                </Label>
                            </div>
                            <h2 className={classes.customer_info_header}>
                                {isGuest ? 'Guest' : 'Your'} Information
                            </h2>
                            <div className="mt-6 text-left">
                                {isGuest ? (
                                    <form
                                        onSubmit={handleGuestCheckout}
                                        className={classes.guest_form}
                                    >
                                        <div className={classes.guest_grid}>
                                            <div
                                                className={
                                                    classes.guest_form_group
                                                }
                                            >
                                                <Label htmlFor="guest-first_name">
                                                    First Name
                                                </Label>
                                                <Input
                                                    id="guest-first_name"
                                                    type="text"
                                                    value={guestData.first_name}
                                                    placeholder="First name"
                                                    onChange={(e) =>
                                                        setGuestData(
                                                            'first_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    autoFocus
                                                />
                                                <InputError
                                                    message={
                                                        guestErrors.first_name
                                                    }
                                                />
                                            </div>
                                            <div
                                                className={
                                                    classes.guest_form_group
                                                }
                                            >
                                                <Label htmlFor="guest-last_name">
                                                    Last Name
                                                </Label>
                                                <Input
                                                    id="guest-last_name"
                                                    type="text"
                                                    value={guestData.last_name}
                                                    placeholder="Last name"
                                                    onChange={(e) =>
                                                        setGuestData(
                                                            'last_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                <InputError
                                                    message={
                                                        guestErrors.last_name
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div
                                            className={classes.guest_form_group}
                                        >
                                            <Label htmlFor="guest-email">
                                                Email
                                            </Label>
                                            <Input
                                                id="guest-email"
                                                type="email"
                                                value={guestData.email}
                                                placeholder="email@example.com"
                                                onChange={(e) =>
                                                    setGuestData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={guestErrors.email}
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={guestProcessing}
                                        >
                                            Continue as Guest
                                        </Button>
                                    </form>
                                ) : (
                                    <Register isGuest={isGuest} />
                                )}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default CustomerInfoStep;
