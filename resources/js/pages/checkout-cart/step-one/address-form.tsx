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

export type AddressFormData = {
    name: string;
    street1: string;
    street2: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
};

// Define the shape of the functions we will expose via the ref
export type AddressFormHandle = {
    // The submit function no longer handles the submission, it just returns data.
    getFormData: () => AddressFormData;
};

const AddressForm = forwardRef<AddressFormHandle, Props>(
    ({ type, user, billingSameAsShipping = false }, ref) => {
        const { setCheckout } = useCheckoutStore();
        const { data, setData, errors } = useForm<AddressFormData>({
            name: '',
            street1: '',
            street2: '',
            city: '',
            state: '',
            zip: '',
            phone: '',
        });

        // Expose the submit function to the parent component via the ref
        useImperativeHandle(ref, () => ({
            getFormData: () => data,
        }));

        // This handler is for submitting the form directly (e.g., if it had its own submit button)
        // const handleFormSubmit: FormEventHandler = (e) => {
        //     e.preventDefault();
        //     // This direct submission logic is now deprecated in favor of the parent controller.
        //     // We leave it here in case it's needed for other purposes.
        //     console.warn(
        //         'Direct form submission from AddressForm is deprecated.',
        //     );
        // };

        const handleStateChange = (value: string) => {
            setData('state', value);
            if (value === 'Washington') {
                setData('city', 'Olympia');
            }
        };

        return (
            <div>
                <form className={classes.form}>
                    <div className={classes.form_group}>
                        <Label htmlFor={`${type}-name`}>Name</Label>
                        <Input
                            id={`${type}-name`}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>
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
                    <div className={classes.footer}></div>
                </form>
            </div>
        );
    },
);

export default AddressForm;
