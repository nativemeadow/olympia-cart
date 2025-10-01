import { useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useShoppingCartStore } from '@/zustand/shoppingCartStore';
import { type SharedData } from '@/types';

import classes from './CartLink.module.css';

// Use direct store subscriptions completely outside React's rendering cycle
export default function CartLink() {
    const countRef = useRef<HTMLSpanElement>(null);
    const { auth } = usePage<SharedData>().props;
    const previousAuthStatus = useRef(!!auth.user);

    // Set up the subscription once on mount, never re-render
    useEffect(() => {
        // Subscribe to the shopping cart store to update the count
        const unsubscribe = useShoppingCartStore.subscribe((state) => {
            if (countRef.current) {
                countRef.current.textContent = state.cartCount().toString();
            }
        });

        // Set initial count
        if (countRef.current) {
            countRef.current.textContent = useShoppingCartStore.getState().cartCount().toString();
        }

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []); // Empty dependency array - run ONCE only

    // Handle authentication state changes
    useEffect(() => {
        // If the user was logged in but now is not, clear the cart.
        if (previousAuthStatus.current && !auth.user) {
            useShoppingCartStore.getState().clearCart();
        }
        previousAuthStatus.current = !!auth.user;
    }, [auth.user]);

    return (
        <div id="/shopping-cart">
            <Link href="/shopping-cart" className={classes['shopping-cart-link']}>
                <img src="/assets/icon-cart.png" alt="shop" height={24} width={24} />
                <span ref={countRef} className={classes['shopping-cart-count']}>
                    0
                </span>
            </Link>
        </div>
    );
}
