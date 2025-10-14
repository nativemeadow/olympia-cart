import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Checkout } from '@/types';

interface CheckoutState {
    checkout: Checkout | null;
    setCheckout: (checkout: Checkout | null) => void;
    getCheckout: () => Checkout | null;
}

export const useCheckoutStore = create<CheckoutState>()(
    devtools((set, get) => ({
        checkout: null,
        setCheckout: (checkout) => set({ checkout }),
        getCheckout: () => get().checkout,
    })),
);
