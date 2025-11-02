import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Checkout } from '@/types';
import { formatDate } from '@/lib/date-util';

const formatTime = (pickupTime: string | null): string => {
    if (!pickupTime) return 'No time selected';
    const [hourStr, minuteStr] = pickupTime.split(':');
    const time = {
        hour: parseInt(hourStr, 10),
        minute: parseInt(minuteStr, 10),
    };
    const date = new Date();
    date.setHours(time.hour, time.minute);
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(date);
};

interface CheckoutState {
    checkout: Checkout | null;
    billingSameAsShipping: boolean;
    setCheckout: (checkout: Checkout | null) => void;
    setBillingSameAsShipping: (isSame: boolean) => void;
    getCheckout: () => Checkout | null;
    getFormattedDate: () => string;
    getFormattedTime: () => string;
}

const useCheckoutStore = create<CheckoutState>()(
    devtools(
        (set, get) => ({
            checkout: null,
            billingSameAsShipping: false,
            setCheckout: (checkout) =>
                set({
                    checkout,
                    billingSameAsShipping:
                        checkout?.billing_same_as_shipping ?? false,
                }),
            setBillingSameAsShipping: (isSame) =>
                set({ billingSameAsShipping: isSame }),
            getCheckout: () => get().checkout,
            getFormattedDate: () => {
                const date = new Date();
                const checkout = get().checkout;
                if (checkout && checkout.is_pickup && checkout.pickup_date) {
                    return formatDate(new Date(checkout.pickup_date));
                }
                if (
                    checkout &&
                    checkout.is_delivery &&
                    checkout.delivery_date
                ) {
                    return formatDate(new Date(checkout.delivery_date));
                }
                return formatDate(date);
            },
            getFormattedTime: () => {
                const checkout = get().checkout;
                if (checkout && checkout.is_pickup && checkout.pickup_time) {
                    return formatTime(checkout.pickup_time);
                }
            },
        }),
        { name: 'CheckoutStore' },
    ),
);

export default useCheckoutStore;
