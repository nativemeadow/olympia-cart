import { usePage } from '@inertiajs/react';
import useCheckOutSteps from '@/zustand/checkoutStepsStore';
import StepOne from './step-one/page';
import StepTwo from './step-two/page';
import StepThree from './step-three/page';
import StepFour from './step-four/page';
import Confirmation from './step-five/page';
import CheckoutLayout from './layout';
import { SharedData } from '@/types';
import { type Checkout } from '@/types';
import { CustomerData } from '@/types/model-types';
import useCheckoutStore from '@/zustand/checkoutStore';
import { useShoppingCartStore } from '@/zustand/shoppingCartStore';

import classes from './checkout.module.css';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

function CheckOutPage() {
    const { auth, customer, checkout } = usePage<
        SharedData & {
            customer: CustomerData;
            checkout: Checkout | null;
        }
    >().props;
    const {
        currentStep,
        steps,
        nextStep,
        previousStep,
        setStepCompleted,
        setStepCanProceed,
        resetCheckout,
    } = useCheckOutSteps();

    const { setCheckout } = useCheckoutStore();

    useEffect(() => {
        setCheckout(checkout);
    }, [checkout, setCheckout]);

    const { cartId } = useShoppingCartStore.getState();

    const handleNextStep = () => {
        if (steps[currentStep].canProceed) {
            nextStep();
        }
    };

    const handlePreviousStep = () => {
        previousStep();
    };

    const handleCompleteStep = () => {
        setStepCompleted(currentStep, true);
        setStepCanProceed(currentStep, true);
    };

    return (
        <CheckoutLayout>
            <>
                <div className={classes.checkout_container}>
                    {/*  */}
                    {currentStep === 'customerInfo' && (
                        <StepOne customer={customer} />
                    )}
                    {currentStep === 'shippingDelivery' && (
                        <StepTwo customer={customer} />
                    )}
                    {currentStep === 'reviewAgreement' && (
                        <StepThree customer={customer} />
                    )}
                    {currentStep === 'payment' && (
                        <StepFour customer={customer} />
                    )}
                    {currentStep === 'confirmation' && (
                        <Confirmation customer={customer} />
                    )}
                </div>
                {/* <div className={classes.checkout_button_group}>
                    <Button
                        className="h-12 rounded bg-yellow-700 text-xl text-white"
                        onClick={handlePreviousStep}
                    >
                        Previous
                    </Button>
                    <Button
                        className="h-12 rounded bg-yellow-700 text-xl text-white"
                        onClick={handleNextStep}
                    >
                        Next
                    </Button>
                    <Button
                        className="h-12 rounded bg-yellow-700 text-xl text-white"
                        onClick={handleCompleteStep}
                    >
                        Complete Current Step
                    </Button>
                    <Button
                        className="h-12 rounded bg-yellow-700 text-xl text-white"
                        onClick={resetCheckout}
                    >
                        Reset Checkout
                    </Button>
                </div> */}
                {/* Display step status */}
                <div className={classes.checkout_container}>
                    {Object.entries(steps).map(
                        ([step, { completed, canProceed }]) => (
                            <div key={step}>
                                {step}: Completed: {completed.toString()}, Can
                                Proceed: {canProceed.toString()}
                            </div>
                        ),
                    )}
                </div>
            </>
        </CheckoutLayout>
    );
}

export default CheckOutPage;
