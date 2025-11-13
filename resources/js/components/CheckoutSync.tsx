import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import useCheckoutStore from '@/zustand/checkoutStore';
import { type SharedData, type Checkout } from '@/types';

const CheckoutSync = () => {
    const { checkout: checkoutProp } = usePage<
        SharedData & { checkout: Checkout | null }
    >().props;
    const { setCheckout } = useCheckoutStore();

    useEffect(() => {
        setCheckout(checkoutProp);
    }, [checkoutProp, setCheckout]);

    return null; // This component does not render anything
};

export default CheckoutSync;
