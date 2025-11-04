import { useEffect, useRef, useMemo } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useShoppingCartStore } from '@/zustand/shoppingCartStore';
import { type SharedData } from '@/types';

import classes from './CartLink.module.css';

export default function CartLink() {
    // This selector ensures the component only re-renders when the cart count changes.
    const cartCount = useShoppingCartStore((state) => state.cartCount());
    const { auth } = usePage<SharedData>().props;
    const previousAuthStatus = useRef(!!auth.user);

    // This effect handles logic that shouldn't cause re-renders.
    useEffect(() => {
        // On logout, clear the client-side cart.
        if (previousAuthStatus.current && !auth.user) {
            useShoppingCartStore.getState().clearCart();
        }
        previousAuthStatus.current = !!auth.user;
    }, [auth.user]);

    // Memoize the cart count display to prevent unnecessary re-renders of the span
    const countDisplay = useMemo(() => {
        return (
            <span className={classes['shopping-cart-count']}>{cartCount}</span>
        );
    }, [cartCount]);

    return (
        <div id="/shopping-cart">
            <Link
                href="/shopping-cart"
                className={classes['shopping-cart-link']}
            >
                <img
                    src="/assets/icon-cart.png"
                    alt="shop"
                    height={24}
                    width={24}
                />
                {countDisplay}
            </Link>
        </div>
    );
}
