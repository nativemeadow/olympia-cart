import React, { useState } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useForm, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import useCheckout from '@/zustand/checkoutStore';
import useCheckoutStepsStore from '@/zustand/checkoutStepsStore';
import useCheckoutStore from '@/zustand/checkoutStore';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CustomerData, Order } from '@/types/model-types';

const formatCardNumber = (value: string): string => {
    const numericValue = value.replace(/\D/g, ''); // Remove non-numeric characters
    let formattedValue = '';
    for (let i = 0; i < numericValue.length; i += 4) {
        formattedValue +=
            numericValue.slice(i, i + 4) +
            (i + 4 < numericValue.length ? ' ' : '');
    }
    return formattedValue.trim(); // Trim trailing space
};

const formatExpiryDate = (value: string): string => {
    const numericValue = value.replace(/\D/g, ''); // Remove non-numeric characters
    if (numericValue.length >= 2) {
        return `${numericValue.slice(0, 2)}/${numericValue.slice(2, 4)}`;
    }
    return numericValue; // Return as is if less than 2 digits
};

const StepFour = ({ customer }: { customer: CustomerData }) => {
    const { props } = usePage();
    const order = (props.flash as any)?.order as Order;
    const { checkout } = useCheckout();
    const { nextStep, previousStep, setStepCompleted, setStepCanProceed } =
        useCheckoutStepsStore();

    const { setCheckout } = useCheckoutStore();

    const { data, setData, post, processing, errors } = useForm({
        checkout_id: checkout?.id || null,
        payment_method: '',
        card_number: '',
        expiry_date: '',
        card_holder_name: '',
        cvv: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting data:', data);
        post(route('payment.store'), {
            preserveScroll: true,
            onSuccess: (page: any) => {
                setStepCompleted('payment', true);
                setStepCanProceed('payment', true);
                nextStep();
            },
            onError: () => {
                setStepCompleted('payment', false);
                setStepCanProceed('payment', false);
            },
        });
    };

    const handlePreviousStep = () => {
        previousStep();
    };

    return (
        <>
            <h1 className="text-2xl font-semibold">Step 4: Payment</h1>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>
                        Please select your preferred payment method:
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        defaultValue=""
                        className="mb-3.5 space-y-4"
                        onValueChange={(value) =>
                            setData('payment_method', value)
                        }
                    >
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem
                                value="credit_card"
                                id="credit_card"
                                className="border-2 border-gray-300"
                            />
                            <Label htmlFor="credit_card">Credit Card</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem
                                value="paypal"
                                id="paypal"
                                className="border-2 border-gray-300"
                            />
                            <Label htmlFor="paypal">PayPal</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem
                                value="cash_on_delivery"
                                id="cash_on_delivery"
                                className="border-2 border-gray-300"
                            />
                            <Label htmlFor="cash_on_delivery">
                                Cash on Delivery
                            </Label>
                        </div>
                    </RadioGroup>
                    {data.payment_method === 'credit_card' && (
                        <div className="mt-1.5 w-6/12 space-y-4 rounded-md border p-4">
                            <form
                                onSubmit={handleSubmit}
                                className="mt-6 space-y-4"
                            >
                                <div>
                                    <Label htmlFor="card_number">
                                        Card Number
                                    </Label>
                                    <Input
                                        id="card_number"
                                        value={data.card_number}
                                        onChange={(e) =>
                                            setData(
                                                'card_number',
                                                formatCardNumber(
                                                    e.target.value,
                                                ),
                                            )
                                        }
                                        placeholder="0000 0000 0000 0000"
                                        maxLength={19}
                                        required
                                    />
                                    <InputError message={errors.card_number} />
                                </div>
                                <div>
                                    <Label htmlFor="expiry_date">
                                        Expiry Date
                                    </Label>
                                    <Input
                                        id="expiry_date"
                                        value={data.expiry_date}
                                        onChange={(e) =>
                                            setData(
                                                'expiry_date',
                                                formatExpiryDate(
                                                    e.target.value,
                                                ),
                                            )
                                        }
                                        placeholder="MM/YY"
                                        required
                                    />
                                    <InputError message={errors.expiry_date} />
                                </div>
                                <div>
                                    <Label htmlFor="card_holder_name">
                                        Card Holder Name
                                    </Label>
                                    <Input
                                        id="card_holder_name"
                                        value={data.card_holder_name}
                                        onChange={(e) =>
                                            setData(
                                                'card_holder_name',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.card_holder_name}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="cvv">CVV</Label>
                                    <Input
                                        id="cvv"
                                        value={data.cvv}
                                        onChange={(e) =>
                                            setData('cvv', e.target.value)
                                        }
                                        placeholder="123"
                                        required
                                        maxLength={3}
                                        minLength={3}
                                    />
                                    <InputError message={errors.cvv} />
                                </div>
                                <Button
                                    disabled={processing}
                                    type="submit"
                                    color="primary"
                                    className="h-12 rounded bg-green-600 text-xl text-white"
                                >
                                    Submit Payment
                                </Button>
                            </form>
                        </div>
                    )}
                    {data.payment_method === 'paypal' && (
                        <p className="mt-4">
                            You will be redirected to PayPal to complete your
                            purchase.
                        </p>
                    )}
                    {data.payment_method === 'cash_on_delivery' && (
                        <p className="mt-4">
                            You will pay in cash upon delivery of your order.
                        </p>
                    )}
                </CardContent>
                <CardFooter className="mt-6 flex justify-between">
                    <Button
                        onClick={handlePreviousStep}
                        color="primary"
                        className="h-12 rounded bg-green-600 text-xl text-white"
                    >
                        Back to Review & Agreement
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={data.payment_method !== 'credit_card'}
                        color="primary"
                        className="h-12 rounded bg-green-600 text-xl text-white"
                    >
                        Proceed to Confirmation
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
};

export default StepFour;
