import React, { FormEventHandler, useEffect, useState } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import useCheckoutStore from '@/zustand/checkoutStore';
import { useShoppingCartStore } from '@/zustand/shoppingCartStore';
import useCheckoutStepsStore from '@/zustand/checkoutStepsStore';
import { getTodayDate } from '@/lib/date-util';
import { InputError } from '@/components/ui/input-error';
import { useForm } from '@inertiajs/react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import classes from './options.module.css';
import clsx from 'clsx';

const PickupOptions = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { checkout } = useCheckoutStore();
    const { cartCount } = useShoppingCartStore();
    const { resetCheckout } = useCheckoutStepsStore();

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

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const submissionRoute = checkout
            ? route('checkout.update', checkout.id)
            : route('checkout.store');
        const httpMethod = checkout ? patch : post;

        httpMethod(submissionRoute, {
            onSuccess: () => {
                resetCheckout();
                closeModal();
                reset();
            },
        });
    };

    if (cartCount() < 1) {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <div
                        className={clsx(
                            classes.options_box,
                            checkout?.is_pickup && classes.selected,
                        )}
                        data-checkout-option={'pickup'}
                        data-disabled={true}
                    >
                        <img
                            height={270}
                            width={315}
                            alt="In-store pickup icon"
                            src="/assets/in-store-pickup-icon.png"
                        />
                        <div className={classes.options_details}>
                            <span className={classes.options_title}>
                                Pickup
                            </span>
                            <span className={classes.options_meta}>
                                Pick up your order from the store
                            </span>
                        </div>
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Your Cart is Empty</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please add items to your shopping cart before
                            selecting a pickup option.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogAction>OK</AlertDialogAction>
                </AlertDialogContent>
            </AlertDialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div
                    className={clsx(
                        classes.options_box,
                        checkout?.is_pickup && classes.selected,
                    )}
                    data-checkout-option={'pickup'}
                    onClick={openModal}
                >
                    <img
                        height={270}
                        width={315}
                        alt="In-store pickup icon"
                        src="/assets/in-store-pickup-icon.png"
                    />
                    <div className={classes.options_details}>
                        <span className={classes.options_title}>Pickup</span>
                        <span className={classes.options_meta}>
                            Pick up your order from the store
                        </span>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>In-Store Pickup</DialogTitle>
                    <DialogDescription>
                        Your order will be available at our location for pickup.
                    </DialogDescription>
                </DialogHeader>
                <form
                    id="pickup-form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <InputError message={errors.cart} />
                    <div className="mb-6 flex w-full flex-wrap items-end gap-4 md:mb-6 md:flex-nowrap">
                        <Input
                            type="date"
                            min={getTodayDate()}
                            value={data.pickup_date}
                            onChange={(e) =>
                                setData('pickup_date', e.target.value)
                            }
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
                            onChange={(e) =>
                                setData('pickup_time', e.target.value)
                            }
                        />
                        <InputError message={errors.pickup_time} />
                    </div>
                    <p className="text-sm text-gray-500">
                        We try our very best to accommodate your requested
                        pickup date and time, however, due to traffic
                        conditions, weather, etc., we do not guarantee any
                        pickup dates or times. Our staff will contact you to
                        confirm your pickup date and time within 1 business day.
                    </p>
                    <p className="text-sm text-gray-500">
                        Please Note: In-store pickup orders will have a 24-hour
                        lead time for processing.
                    </p>
                </form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        color="primary"
                        disabled={processing}
                        className="w-full rounded bg-yellow-700 text-xl text-white"
                        type="submit"
                        form="pickup-form"
                    >
                        Confirm Pickup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PickupOptions;
