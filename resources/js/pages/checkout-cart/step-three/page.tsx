import { CustomerData } from '@/types/model-types';
import useCheckout from '@/zustand/checkoutStore';
import { useShoppingCartStore } from '@/zustand/shoppingCartStore';
import useCheckoutStepsStore from '@/zustand/checkoutStepsStore';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/types/model-types';
import classes from './step-three.module.css';
import { useForm } from '@inertiajs/react';

const categoryPath = 'categories';
const productPath = 'products';

const StepThree = ({ customer }: { customer: CustomerData }) => {
    const { checkout } = useCheckout();

    const { nextStep, previousStep, setStepCompleted, setStepCanProceed } =
        useCheckoutStepsStore();

    const { data, post, processing, errors } = useForm({
        ...checkout,
    });

    const { delivery_address, billing_address, billing_same_as_shipping } =
        checkout || {};
    const productLink = `/${categoryPath}/${productPath}/`;

    const { items, cartTotal } = useShoppingCartStore();

    console.log(
        'StepThree render - checkout:',
        checkout,
        'customer:',
        customer,
    );

    const handleContinueToPayment = () => {
        if (!checkout?.cart_id) {
            console.error('No cart associated with checkout.');
            return;
        }

        post(route('order.store'), {
            preserveScroll: true,
            onSuccess: (page: any) => {
                setStepCompleted('reviewAgreement', true);
                setStepCanProceed('reviewAgreement', true);
                nextStep();
            },
            onError: () => {
                setStepCompleted('reviewAgreement', false);
                setStepCanProceed('reviewAgreement', false);
            },
        });
    };

    const handlePreviousStep = () => {
        previousStep();
    };

    return (
        <>
            <h1 className="mb-4 text-2xl font-bold">
                Step 3: Review Your Order
            </h1>
            <div className={classes['review-container']}>
                <div className={classes.address_section}>
                    <div>
                        <h2 className="text-xl font-bold">Shipping Address</h2>
                        {checkout?.is_delivery && checkout?.delivery_address ? (
                            <div
                                key={checkout?.delivery_address.id}
                                className="mb-4 rounded border p-4"
                            >
                                <p>{checkout?.delivery_address.street1}</p>
                                <p>
                                    {checkout?.delivery_address.city},
                                    {checkout?.delivery_address.state}
                                    {checkout?.delivery_address.zip}
                                </p>
                                <p>Phone: {checkout?.delivery_address.phone}</p>
                            </div>
                        ) : (
                            <p>No addresses available.</p>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Billing Address</h2>
                        {checkout?.billing_address ? (
                            <div
                                key={checkout?.billing_address.id}
                                className="mb-4 rounded border p-4"
                            >
                                <p>{checkout?.billing_address.street1}</p>
                                <p>
                                    {checkout?.billing_address.city},
                                    {checkout?.billing_address.state}
                                    {checkout?.billing_address.zip}
                                </p>
                                <p>Phone: {checkout?.billing_address.phone}</p>
                            </div>
                        ) : (
                            <p>No addresses available.</p>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Order Options</h2>
                        <div className="mb-4 rounded border p-4">
                            {checkout?.is_delivery ? (
                                <>
                                    <p>
                                        Delivery Instructions:{' '}
                                        {checkout?.instructions || 'None'}
                                    </p>
                                    <p>
                                        Delivery Date & Time:{' '}
                                        {checkout?.delivery_date}
                                    </p>
                                </>
                            ) : checkout?.is_pickup ? (
                                <p>
                                    Pickup Date & Time: {checkout?.pickup_date}{' '}
                                    at {checkout?.pickup_time}
                                </p>
                            ) : (
                                <p>No order options selected.</p>
                            )}
                        </div>
                    </div>
                    {/* Placeholder for Terms and Conditions Agreement */}
                    <div className="mt-4 rounded-md border p-4">
                        <h3 className="mb-2 text-lg font-semibold">
                            Terms & Agreement
                        </h3>
                        <p className="text-sm text-gray-600">
                            By clicking "Continue to Payment", you agree to our
                            terms of service and privacy policy. Please review
                            them carefully. (Placeholder text)
                        </p>
                        {/* You might want a checkbox here for explicit agreement */}
                    </div>
                </div>
                <div className={classes.order_summary_section}>
                    <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
                    {items && items.length > 0 ? (
                        <>
                            {items.map((item: CartItem) => (
                                <div
                                    key={item.id}
                                    className="flex items-center space-x-4 border-b py-2 last:border-b-0 last:pb-0"
                                >
                                    <div>
                                        <img
                                            className={classes.image}
                                            src={`/products/${item.image}`}
                                            alt={item.title}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-medium">
                                            {item.title}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Qty: {item.quantity} - Price: $
                                            {item.price.toFixed(2)}
                                        </p>
                                        <p className="font-semibold">
                                            $
                                            {(
                                                item.price * item.quantity
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-4 flex justify-end border-t pt-4 text-lg font-bold">
                                <span>Total:</span>
                                <span className="ml-4">${cartTotal()}</span>
                            </div>
                        </>
                    ) : (
                        <p>Your cart is empty.</p>
                    )}
                </div>
            </div>

            <div className="mt-6 flex justify-between">
                <Button
                    onClick={handlePreviousStep}
                    color="primary"
                    className="h-12 rounded bg-green-600 text-xl text-white"
                >
                    {checkout?.is_delivery
                        ? 'Go Back to Shipping & Delivery Options'
                        : 'Go Back to Pickup Options'}
                </Button>
                <Button
                    disabled={processing}
                    onClick={handleContinueToPayment}
                    // color="primary"
                    className="h-12 rounded bg-green-600 text-xl text-white"
                >
                    Continue to Payment
                </Button>
            </div>
        </>
    );
};

export default StepThree;
