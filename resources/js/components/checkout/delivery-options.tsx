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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import useCheckoutStore from '@/zustand/checkoutStore';
import { useShoppingCartStore } from '@/zustand/shoppingCartStore';
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
import clsx from 'clsx';
import classes from './options.module.css';

const DeliveryOptions = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { checkout } = useCheckoutStore();
    const { cartCount } = useShoppingCartStore();

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

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        console.log('Submitting data:', data);
        const submissionRoute = checkout
            ? route('checkout.update', checkout.id)
            : route('checkout.store');
        const httpMethod = checkout ? patch : post;

        httpMethod(submissionRoute, {
            onSuccess: () => {
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
                            checkout?.is_delivery && classes.selected,
                        )}
                        data-checkout-option={'delivery'}
                        data-disabled={true}
                    >
                        <img
                            height={270}
                            width={315}
                            alt=""
                            src="/assets/delivery-icon.png"
                        />
                        <div className={classes.options_details}>
                            <span className={classes.options_title}>
                                Delivery
                            </span>
                            <span className={classes.options_meta}>
                                Have your order delivery to you home
                            </span>
                        </div>
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Your Cart is Empty</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please add items to your shopping cart before
                            selecting a delivery option.
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
                        checkout?.is_delivery && classes.selected,
                    )}
                    data-checkout-option={'delivery'}
                    onClick={openModal}
                >
                    <img
                        height={270}
                        width={315}
                        alt=""
                        src="/assets/delivery-icon.png"
                    />
                    <div className={classes.options_details}>
                        <span className={classes.options_title}>Delivery</span>
                        <span className={classes.options_meta}>
                            Have your order delivery to you home
                        </span>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delivery</DialogTitle>
                    <DialogDescription>
                        Your order will be delivered to your home.
                    </DialogDescription>
                </DialogHeader>
                <form
                    id="delivery-form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <InputError message={errors.cart} />
                    <div className="grid gap-2">
                        <Label htmlFor="pickup_time">
                            Delivery instructions are required to proceed to
                            checkout:
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
                            Please Note: Our delivery trucks will not be able to
                            go off pavement. We can either dump on your driveway
                            or on the street (customer must be present to dump
                            on public streets).
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

                    <p className="text-sm text-gray-500">
                        We try our very best to accommodate your requested
                        delivery date, however, due to traffic conditions,
                        weather, etc., we do not guarantee any delivery dates or
                        times. Often times, we are able to deliver before your
                        requested date. Our staff will contact you to confirm
                        your delivery date and time within 1 business day. No
                        deliveries will be made on weekends and Holidays.
                    </p>
                    <p className="font- text-sm font-bold text-gray-500">
                        Please Note: All deliveries will have a 48-hour lead up
                        and delivery will only be available Monday - Friday.
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
                        form="delivery-form"
                    >
                        Confirm Delivery
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeliveryOptions;
