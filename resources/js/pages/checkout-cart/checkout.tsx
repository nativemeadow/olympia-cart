import { usePage } from '@inertiajs/react';
import useCheckOutSteps from '@/zustand/checkoutStepsStore';
import StepOne from './step-one/page';
import StepTwo from './step-two/page';
import StepThree from './step-three/page';
import StepFour from './step-four/page';
import Confirmation from './step-five/page';
import CheckoutLayout from './layout';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import type { User } from '@/types';
import { Address } from '@/types/model-types';
import { useShoppingCartStore } from '@/zustand/shoppingCartStore';

import classes from './checkout.module.css';

type CustomerData = (User & { addresses: Address[] }) | null;

function CheckOutPage() {
    const { auth, customer } = usePage<
        SharedData & { customer: CustomerData }
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
                    {currentStep === 'confirmation' && <Confirmation />}
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
