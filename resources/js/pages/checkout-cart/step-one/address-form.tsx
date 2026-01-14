import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Checkout } from '@/types';
import { User } from '@/types/model-types';
import { states } from '@/utils/counties-locals/states';
import useCheckoutStore from '@/zustand/checkoutStore';

import { router, useForm } from '@inertiajs/react';
import axios from 'axios';
import {
    useRef,
    FormEventHandler,
    forwardRef,
    useImperativeHandle,
} from 'react'; // Import forwardRef and useImperativeHandle

import classes from './address-form.module.css';

type Props = {
    type: 'billing' | 'shipping';
    user: User | null;
    billingSameAsShipping?: boolean;
};

// Define the shape of the functions we will expose via the ref
export type AddressFormHandle = {
    // The submit function can now accept an options object with its own onSuccess
    submit: (options: { onSuccess: (newCheckout: Checkout) => void }) => void;
};

const AddressForm = forwardRef<AddressFormHandle, Props>(
    ({ type, user, billingSameAsShipping = false }, ref) => {
        const { setCheckout } = useCheckoutStore();
        const { data, setData, post, processing, errors, reset, isDirty } =
            useForm({
                street1: '',
                street2: '',
                city: '',
                state: '',
                zip: '',
                phone: '',
                // These are for the authenticated user route
                billing: type === 'billing' || billingSameAsShipping,
                default: type === 'shipping' || billingSameAsShipping,
            });

        const performSubmit = (
            onSuccessCallback?: (newCheckout: Checkout) => void,
        ) => {
            // If the user is a guest, we use a different route and method.
            if (!user) {
                const guestAddressData = {
                    ...data,
                    type: type, // 'shipping' or 'billing'
                    billing_same_as_shipping: billingSameAsShipping,
                };

                axios
                    .post(
                        //route('checkout.guest.address.store'),
                        route('checkout-cart.checkout.guest.address.store'),
                        guestAddressData,
                    )
                    .then((response) => {
                        const newCheckout = response.data as Checkout;
                        reset();
                        setCheckout(newCheckout);
                        onSuccessCallback?.(newCheckout);
                    })
                    .catch((error) => {
                        console.error(
                            'Error saving guest address:',
                            error.response?.data,
                        );
                        // Optionally, handle validation errors from axios
                        if (error.response && error.response.status === 422) {
                            // You might want to set these errors on the form
                        }
                        alert('Could not save address. Please try again.');
                    });
                return;
            }

            // This is the existing logic for authenticated users.
            const addressData = {
                ...data,
                billing_same_as_shipping: billingSameAsShipping,
            };
            post(route('address.store'), {
                ...addressData,
                preserveScroll: true,
                onSuccess: (page) => {
                    const newCheckout = page.props.checkout as Checkout;
                    reset();
                    setCheckout(newCheckout);
                    onSuccessCallback?.(newCheckout);
                    // This ensures the parent component's `localAddresses` state will be updated.
                    router.visit(window.location.href, {
                        preserveState: true,
                        preserveScroll: true,
                    });
                },
            });
        };

        // Expose the submit function to the parent component via the ref
        useImperativeHandle(ref, () => ({
            submit({ onSuccess }) {
                performSubmit(onSuccess);
            },
        }));

        const handleFormSubmit: FormEventHandler = (e) => {
            e.preventDefault();
            performSubmit(); // Call with no options
        };

        const handleStateChange = (value: string) => {
            setData('state', value);
            if (value === 'Washington') {
                setData('city', 'Olympia');
            }
        };

        return (
            <div>
                <form onSubmit={handleFormSubmit} className={classes.form}>
                    <div className={classes.form_group}>
                        <Label htmlFor={`${type}-street1`}>
                            Street Address
                        </Label>
                        <Input
                            id={`${type}-street1`}
                            value={data.street1}
                            onChange={(e) => setData('street1', e.target.value)}
                            required
                        />
                        <InputError message={errors.street1} />
                    </div>
                    <div className={classes.form_group}>
                        <Label htmlFor={`${type}-street2`}>
                            Apt, Suite, etc. (optional)
                        </Label>
                        <Input
                            id={`${type}-street2`}
                            value={data.street2}
                            onChange={(e) => setData('street2', e.target.value)}
                        />
                        <InputError message={errors.street2} />
                    </div>
                    <div className={classes.grid}>
                        <div className={classes.form_group}>
                            <Label htmlFor={`${type}-city`}>City</Label>
                            <Input
                                id={`${type}-city`}
                                value={data.city}
                                onChange={(e) =>
                                    setData('city', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.city} />
                        </div>
                    </div>
                    <div className={classes.form_group}>
                        <div className={classes.state_zip_grid}>
                            <div className={classes.state_zip_group}>
                                <Label htmlFor={`${type}-state`}>State</Label>
                                <select
                                    id={`${type}-state`}
                                    value={data.state}
                                    onChange={(e) =>
                                        handleStateChange(e.target.value)
                                    }
                                    required
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select a state</option>
                                    {states.map((s) => (
                                        <option
                                            key={s.abbreviation}
                                            value={s.name}
                                        >
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.state} />
                            </div>
                            <div className={classes.state_zip_group}>
                                <Label htmlFor={`${type}-zip`}>Zip Code</Label>
                                <Input
                                    id={`${type}-zip`}
                                    value={data.zip}
                                    onChange={(e) =>
                                        setData('zip', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.zip} />
                            </div>
                        </div>
                        <div className={classes.form_group}>
                            <Label htmlFor={`${type}-phone`}>
                                Phone Number
                            </Label>
                            <Input
                                id={`${type}-phone`}
                                type="tel"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.phone} />
                        </div>
                    </div>
                    <div className={classes.footer}>
                        <Button type="submit" disabled={processing}>
                            Save Address
                        </Button>
                    </div>
                </form>
            </div>
        );
    },
);

export default AddressForm;
