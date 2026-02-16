import { useEffect, useRef } from 'react';
import { CustomerData } from '@/types/model-types';
import useCheckout from '@/zustand/checkoutStore';
import useCheckoutStepsStore from '@/zustand/checkoutStepsStore';
import PickupOptions from './pickup-options';
import { Button } from '@/components/ui/button';
import DeliveryOptions from './delivery-options';
import AddressDisplayCard from './address-display-card';
import classes from './address-display-card.module.css';
import { router } from '@inertiajs/react';
import isEqual from '@/utils/deepCompare';

interface CheckoutOptions {
    is_pickup: boolean;
    is_delivery: boolean;
    pickup_date: string | null;
    pickup_time: string | null;
    delivery_date: string | null;
    instructions: string | null;
}

function StepTwo({ customer }: { customer: CustomerData }) {
    const { checkout } = useCheckout();
    const { nextStep, previousStep, setStepCompleted, setStepCanProceed } =
        useCheckoutStepsStore();

    // Use a ref to store the initial state of the checkout options
    const initialCheckoutOptions = useRef<CheckoutOptions | null>(null);

    useEffect(() => {
        if (checkout && !initialCheckoutOptions.current) {
            // Store the relevant initial state when the component mounts
            initialCheckoutOptions.current = {
                is_pickup: checkout.is_pickup,
                is_delivery: checkout.is_delivery,
                pickup_date: checkout.pickup_date,
                pickup_time: checkout.pickup_time,
                delivery_date: checkout.delivery_date,
                instructions: checkout.instructions,
            };
        }
    }, [checkout]);

    console.log('StepTwo render - checkout:', checkout, 'customer:', customer);

    const { delivery_address, billing_address, billing_same_as_shipping } =
        checkout || {};

    const handleContinueToReview = () => {
        if (!checkout) return;

        const currentOptions = {
            is_pickup: checkout.is_pickup,
            is_delivery: checkout.is_delivery,
            pickup_date: checkout.pickup_date,
            pickup_time: checkout.pickup_time,
            delivery_date: checkout.delivery_date,
            instructions: checkout.instructions,
        };

        // Compare the current state with the initial state
        const hasChanges = !isEqual(
            initialCheckoutOptions.current,
            currentOptions,
        );

        const proceed = () => {
            setStepCanProceed('shippingDelivery', true);
            setStepCompleted('shippingDelivery', true);
            nextStep();
        };

        if (hasChanges) {
            // If there are changes, save them before proceeding
            router.patch(
                route('checkout-cart.processStepTwo', checkout.id),
                currentOptions,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Update the ref with the new saved state
                        initialCheckoutOptions.current = currentOptions;
                        proceed();
                    },
                    onError: (errors) => {
                        console.error(
                            'Failed to save shipping/delivery options:',
                            errors,
                        );
                        alert(
                            'There was an error saving your options. Please try again.',
                        );
                    },
                },
            );
        } else {
            // If there are no changes, just proceed to the next step
            proceed();
        }
    };

    const handlePreviousStep = () => {
        previousStep();
    };

    return (
        <>
            <h1 className="mb-4 text-2xl font-bold">
                Step 2: Shipping & Delivery Options
            </h1>

            <div className={classes.address_grid}>
                {checkout?.is_delivery && delivery_address ? (
                    <AddressDisplayCard
                        title={
                            checkout?.delivery_address_id ===
                                checkout?.billing_address_id && billing_address
                                ? 'Delivery & Billing Address'
                                : 'Shipping Address'
                        }
                        address={delivery_address}
                    />
                ) : checkout?.is_pickup && billing_address ? (
                    <AddressDisplayCard
                        title="Billing Address"
                        address={billing_address}
                        isSameAsShipping={billing_same_as_shipping}
                    />
                ) : null}

                {checkout?.is_delivery &&
                checkout?.delivery_address_id !==
                    checkout?.billing_address_id &&
                billing_address ? (
                    <AddressDisplayCard
                        title="Billing Address"
                        address={billing_address}
                        isSameAsShipping={billing_same_as_shipping}
                    />
                ) : null}
            </div>
            <div className="mt-8">
                {checkout?.is_pickup ? <PickupOptions /> : <DeliveryOptions />}
            </div>
            <div className="mt-6 flex justify-between">
                <Button
                    onClick={handlePreviousStep}
                    color="primary"
                    className="h-12 rounded bg-green-600 text-xl text-white"
                >
                    Go back to your customer details
                </Button>
                <Button
                    onClick={handleContinueToReview}
                    color="primary"
                    className="h-12 rounded bg-green-600 text-xl text-white"
                >
                    Continue to Review
                </Button>
            </div>
        </>
    );
}

export default StepTwo;
