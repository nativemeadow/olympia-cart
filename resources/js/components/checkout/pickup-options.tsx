import React, { useState, FormEventHandler, useMemo } from 'react';
import {
    TimeInput,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Divider,
    Textarea,
    DatePicker,
} from '@heroui/react';

import { Checkout } from '@/types';
import useCheckoutStore from '@/zustand/checkoutStore'; // This import seems unused.
import { useShoppingCartStore } from '@/zustand/shoppingCartStore';
import { formatDate, getTodayDate } from '@/lib/date-util';
import { InputError } from '@/components/ui/input-error';
import { parseTime, Time } from '@internationalized/date';
import { Head, useForm, usePage } from '@inertiajs/react';

import classes from './options.module.css';
import { M } from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js';

const initialState = {
    pickup_date: {
        year: 0,
        month: 0,
        day: 0,
    },
    pickup_time: '',
};

type Props = {
    setCheckoutOption: (option: string) => void;
};

const PickupOptions = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { checkout, setCheckout, getCheckout } = useCheckoutStore();
    const { items, cartCount } = useShoppingCartStore(); // These seem unused.

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        ...initialState,
    });

    const pickupTimeValue = useMemo(() => {
        try {
            return data.pickup_time ? parseTime(data.pickup_time) : null;
        } catch (e) {
            return null;
        }
    }, [data.pickup_time]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
    };

    return (
        <>
            <div className={classes.options_box} data-checkout-option={'pickup'} onClick={onOpen}>
                <img height={270} width={315} alt="In-store pickup icon" src="/assets/in-store-pickup-icon.png" />
                <div className={classes.options_details}>
                    <span className={classes.options_title}>Pickup</span>
                    <span className={classes.options_meta}>Pick up your order from the store</span>
                </div>
            </div>

            <Modal
                backdrop="opaque"
                isOpen={isOpen}
                onClose={onClose}
                radius="sm"
                classNames={{
                    base: 'bg-white dark:bg-zinc-900',
                    backdrop: 'rounded bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20',
                }}
            >
                <ModalContent className="m-2.5">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">In-Store Pickup</ModalHeader>
                            <ModalBody>
                                <form id="pickup-form" onSubmit={handleSubmit}>
                                    <p>Your order will be available at our location for pickup.</p>
                                    <div className="mb-6 flex w-full flex-wrap items-end gap-4 md:mb-0 md:flex-nowrap">
                                        <input
                                            type="date"
                                            min={getTodayDate()}
                                            className="w-60 rounded-md border border-transparent bg-gray-100 p-2"
                                        />
                                        <InputError message={errors.pickup_date} />
                                    </div>
                                    <div>
                                        <TimeInput
                                            label="Pickup Time"
                                            labelPlacement="outside"
                                            value={pickupTimeValue}
                                            onChange={(value) => setData('pickup_time', value ? value.toString() : '')}
                                        />
                                    </div>
                                    <p>
                                        We try our very best to accommodate your requested pickup date and time, however, due to traffic conditions,
                                        weather, etc., we do not guarantee any pickup dates or times. Our staff will contact you to confirm your
                                        pickup date and time within 1 business day.
                                    </p>
                                    <p>Please Note: In-store pickup orders will have a 24-hour lead time for processing.</p>
                                </form>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="solid" color="secondary" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    disabled={processing}
                                    className="w-full rounded bg-yellow-700 text-xl text-white"
                                    type="submit"
                                    form="pickup-form"
                                >
                                    Confirm Pickup
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

export default PickupOptions;
