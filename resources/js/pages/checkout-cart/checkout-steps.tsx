import useCheckOutSteps from '@/zustand/checkoutStepsStore';
import useCheckoutStore from '@/zustand/checkoutStore';

const Steps = [
    { CustomerInfo: 'Customer Info' },
    {
        ShippingDelivery: {
            delivery: 'Shipping & Delivery',
            pickup: 'Billing & Pickup',
        },
    },
    { ReviewAgreement: 'Review & Agreement' },
    { Payment: 'Payment' },
    { Confirmation: 'Confirmation' },
];

const currentStepColor = 'bg-yellow-700';
const currentStepTextColor = 'text-white';

const stepColor = 'bg-white';
const stepsTextColor = 'text-gray-400';

const CheckoutSteps = () => {
    const { getCurrentStepNumber } = useCheckOutSteps();
    const { checkout } = useCheckoutStore();

    // Example: If you want to get the current step label based on the option
    const currentStep = Steps.map((step) => {
        if (step.ShippingDelivery) {
            // If checkout is 'pickup', use 'Billing & Pickup', otherwise default to 'Shipping & Delivery'
            const effectiveOption = checkout?.is_pickup ? 'pickup' : 'delivery';
            return step.ShippingDelivery[effectiveOption];
        }

        return Object.values(step)[0] as string;
    });

    return (
        <>
            <div className="mb-20 flex h-3 w-full items-center bg-gray-200">
                <div className="flex w-full justify-evenly">
                    {currentStep.map((label, index) => {
                        return (
                            <div key={index} className={`mt-9 flex flex-1 flex-col items-center`}>
                                <div
                                    className={`h-16 w-16 border-2 ${
                                        index === getCurrentStepNumber() ? currentStepColor : stepColor
                                    } flex justify-center rounded-full border-gray-200`}
                                >
                                    <span
                                        className={`${
                                            index === getCurrentStepNumber() ? currentStepTextColor : stepsTextColor
                                        } self-center font-raleway text-3xl font-bold`}
                                    >
                                        {index + 1}
                                    </span>
                                </div>
                                <div className={`mt-4 text-center font-raleway font-medium`}>{label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default CheckoutSteps;
