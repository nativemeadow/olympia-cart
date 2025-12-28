import React, { FormEventHandler, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getTodayDate } from '@/lib/date-util';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import useCheckoutStore from '@/zustand/checkoutStore';
import { InputError } from '@/components/ui/input-error';
import { useForm } from '@inertiajs/react';

import classes from './options.module.css';

const DeliveryOptions = () => {
    const { checkout } = useCheckoutStore();
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        is_pickup: false,
        is_delivery: true,
        delivery_date: checkout?.delivery_date || '',
        instructions: checkout?.instructions || '',
        cart: null,
    });

    useEffect(() => {
        if (checkout) {
            setData({
                is_pickup: false,
                is_delivery: true,
                delivery_date: checkout.delivery_date || '',
                instructions: checkout.instructions || '',
            });
        }
    }, [checkout]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        console.log('Submitting data:', data);
        const submissionRoute = checkout
            ? route('checkout.update', { ...checkout, data })
            : route('checkout.store');
        const httpMethod = checkout ? patch : post;

        httpMethod(submissionRoute, {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <div className={classes.options_box}>
            <form
                id="delivery-form"
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <InputError message={errors.cart} />
                <div className="mb-4">
                    <h2 className="text-xl font-bold">Delivery Options</h2>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="pickup_time">
                        Please verify your delivery instructions:
                    </Label>
                    <Textarea
                        id="instructions"
                        value={data.instructions}
                        onChange={(e) =>
                            setData('instructions', e.target.value)
                        }
                        placeholder="Delivery Instructions"
                    />
                    <InputError message={errors.instructions} />
                    <p>
                        Please Note: Our delivery trucks will not be able to go
                        off pavement. We can either dump on your driveway or on
                        the street (customer must be present to dump on public
                        streets).
                    </p>
                </div>
                <div className="mb-6 flex w-full flex-wrap items-end gap-4 md:mb-0 md:flex-nowrap">
                    <Input
                        type="date"
                        min={getTodayDate()}
                        value={data.delivery_date}
                        onChange={(e) =>
                            setData('delivery_date', e.target.value)
                        }
                        className="w-60 rounded-md border border-transparent bg-gray-100 p-2"
                    />
                    <InputError message={errors.delivery_date} />
                </div>
                <Button
                    color="primary"
                    disabled={processing}
                    className="w-full rounded bg-yellow-700 text-xl text-white"
                    type="submit"
                    form="delivery-form"
                >
                    Update Delivery Options
                </Button>
            </form>
        </div>
    );
};

export default DeliveryOptions;
