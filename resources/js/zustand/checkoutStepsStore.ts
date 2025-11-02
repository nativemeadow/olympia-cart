import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Define the possible steps in the checkout process
export type CheckoutStep =
    | 'customerInfo'
    | 'shippingDelivery'
    | 'reviewAgreement'
    | 'payment'
    | 'confirmation';

// Define the structure for step information
interface StepInfo {
    completed: boolean;
    canProceed: boolean;
}

// Define the structure of our steps
interface CheckoutStore {
    currentStep: CheckoutStep;
    steps: Record<CheckoutStep, StepInfo>;
    setCurrentStep: (step: CheckoutStep) => void;
    nextStep: () => void;
    previousStep: () => void;
    setStepCompleted: (step: CheckoutStep, completed: boolean) => void;
    setStepCanProceed: (step: CheckoutStep, canProceed: boolean) => void;
    resetCheckout: () => void;
    getCurrentStepNumber: () => number;
}

const stepOrder: CheckoutStep[] = [
    'customerInfo',
    'shippingDelivery',
    'reviewAgreement',
    'payment',
    'confirmation',
];

// Create the store
const useCheckoutStepsStore = create<CheckoutStore>()(
    devtools(
        (set, get) => ({
            currentStep: 'customerInfo',
            steps: {
                customerInfo: { completed: false, canProceed: false },
                shippingDelivery: { completed: false, canProceed: false },
                reviewAgreement: { completed: false, canProceed: false },
                payment: { completed: false, canProceed: false },
                confirmation: { completed: false, canProceed: false },
            },
            setCurrentStep: (step) => set({ currentStep: step }),
            nextStep: () => {
                const { currentStep, steps } = get();
                const currentIndex = stepOrder.indexOf(currentStep);
                if (
                    currentIndex < stepOrder.length - 1 &&
                    steps[currentStep].canProceed
                ) {
                    set({ currentStep: stepOrder[currentIndex + 1] });
                }
            },
            previousStep: () => {
                const { currentStep } = get();
                const currentIndex = stepOrder.indexOf(currentStep);
                if (currentIndex > 0) {
                    set({ currentStep: stepOrder[currentIndex - 1] });
                }
            },
            setStepCompleted: (step, completed) =>
                set((state) => ({
                    steps: {
                        ...state.steps,
                        [step]: { ...state.steps[step], completed },
                    },
                })),
            setStepCanProceed: (step, canProceed) =>
                set((state) => ({
                    steps: {
                        ...state.steps,
                        [step]: { ...state.steps[step], canProceed },
                    },
                })),
            resetCheckout: () =>
                set({
                    currentStep: 'customerInfo',
                    steps: {
                        customerInfo: { completed: false, canProceed: false },
                        shippingDelivery: {
                            completed: false,
                            canProceed: false,
                        },
                        reviewAgreement: {
                            completed: false,
                            canProceed: false,
                        },
                        payment: { completed: false, canProceed: false },
                        confirmation: { completed: false, canProceed: false },
                    },
                }),
            getCurrentStepNumber: () => {
                const { currentStep } = get();
                return stepOrder.indexOf(currentStep);
            },
        }),
        { name: 'CheckoutStepsStore' },
    ),
);

export default useCheckoutStepsStore;
