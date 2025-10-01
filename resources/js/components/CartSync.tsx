import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useShoppingCartStore } from '@/zustand/shoppingCartStore';
import { type SharedData } from '@/types';

const CartSync = () => {
    const { cart } = usePage<SharedData>().props;
    const { syncCart } = useShoppingCartStore();

    useEffect(() => {
        syncCart(cart);
    }, [cart, syncCart]);

    return null; // This component does not render anything
};

export default CartSync;
