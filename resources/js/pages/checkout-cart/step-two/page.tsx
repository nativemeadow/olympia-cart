import { CustomerData } from '@/types/model-types';
import useCheckout from '@/zustand/checkoutStore';
import useCheckoutStepsStore from '@/zustand/checkoutStepsStore';
import PickupOptions from './pickup-options';
import { Button } from '@/components/ui/button';
import DeliveryOptions from './delivery-options';
import AddressDisplayCard from './address-display-card';
import classes from './address-display-card.module.css';

function StepTwo({ customer }: { customer: CustomerData }) {
    const { checkout } = useCheckout();
    const { nextStep, previousStep, setStepCompleted, setStepCanProceed } =
        useCheckoutStepsStore();

    console.log('StepTwo render - checkout:', checkout, 'customer:', customer);

    const { delivery_address, billing_address, billing_same_as_shipping } =
        checkout || {};

    const handleContinueToReview = () => {
        setStepCanProceed('shippingDelivery', true);
        setStepCompleted('shippingDelivery', true);
        nextStep();
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
