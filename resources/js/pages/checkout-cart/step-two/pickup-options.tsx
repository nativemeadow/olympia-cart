import React, { FormEventHandler, useEffect, useState } from 'react';

import useCheckoutStore from '@/zustand/checkoutStore';
import { useShoppingCartStore } from '@/zustand/shoppingCartStore';
import { getTodayDate } from '@/lib/date-util';
import { InputError } from '@/components/ui/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';

import classes from './options.module.css';

const PickupOptions = () => {
    const { checkout } = useCheckoutStore();
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        is_pickup: true,
        is_delivery: false,
        pickup_date: checkout?.pickup_date || '',
        pickup_time: checkout?.pickup_time || '',
        cart: null,
    });

    useEffect(() => {
        if (checkout) {
            setData({
                is_pickup: true,
                is_delivery: false,
                pickup_date: checkout.pickup_date || '',
                pickup_time: checkout.pickup_time || '',
            });
        }
    }, [checkout]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const submissionRoute = checkout
            ? route('checkout.update', checkout.id)
            : route('checkout.store');
        const httpMethod = checkout ? patch : post;

        httpMethod(submissionRoute, {
            onSuccess: () => {
                //reset();
            },
        });
    };

    return (
        <div className={classes.options_box}>
            <form
                id="pickup-form"
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <InputError message={errors.cart} />
                <div className="mb-4">
                    <h2 className="text-xl font-bold">Pickup Options</h2>
                    <p className="text-sm text-gray-500">
                        Please verify your preferred pickup date and time:
                    </p>
                </div>
                <div className="mb-6 flex w-full flex-wrap items-end gap-4 md:mb-6 md:flex-nowrap">
                    <Input
                        type="date"
                        min={getTodayDate()}
                        value={data.pickup_date}
                        onChange={(e) => setData('pickup_date', e.target.value)}
                        className="w-60 rounded-md border border-transparent bg-gray-100 p-2"
                    />
                    <InputError message={errors.pickup_date} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="pickup_time">Pickup Time</Label>
                    <Input
                        id="pickup_time"
                        type="time"
                        value={data.pickup_time}
                        onChange={(e) => setData('pickup_time', e.target.value)}
                    />
                    <InputError message={errors.pickup_time} />
                </div>
                <p className="text-sm text-gray-500">
                    We try our very best to accommodate your requested pickup
                    date and time, however, due to traffic conditions, weather,
                    etc., we do not guarantee any pickup dates or times. Our
                    staff will contact you to confirm your pickup date and time
                    within 1 business day.
                </p>
                <p className="text-sm text-gray-500">
                    Please Note: In-store pickup orders will have a 24-hour lead
                    time for processing.
                </p>
                <Button
                    color="primary"
                    disabled={processing}
                    className="w-full rounded bg-yellow-700 text-xl text-white"
                    type="submit"
                    form="pickup-form"
                >
                    Update Pickup Options
                </Button>
            </form>
        </div>
    );
};

export default PickupOptions;
