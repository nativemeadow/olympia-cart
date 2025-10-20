import React, { useState, useEffect } from 'react';
import DeliveryOptions from '@/components/checkout/delivery-options';
import PickupOptions from '@/components/checkout/pickup-options';
import useCheckoutStore from '@/zustand/checkoutStore';
import { Cart, CartItem } from '@/types/model-types';
import { type Checkout } from '@/types';
import ShoppingCartItem from '@/components/shopping-cart';

import classes from './cart.module.css';

type Props = {
    cart: Cart;
    checkout?: Checkout;
};

const ShoppingCart = ({ cart, checkout }: Props) => {
    const [cartTotal, setCartTotal] = useState(cart ? cart.total : 0);
    const { setCheckout } = useCheckoutStore();

    useEffect(() => {
        if (cart) {
            setCartTotal(cart.total);
        }
        // Sync the checkout data from props with the Zustand store
        setCheckout(checkout || null);
    }, [cart]);

    return (
        <>
            <h1 className={classes['cart-title']}>Shopping Cart</h1>
            <div className={classes['cart-grid']}>
                <div id={classes.leftCart}>
                    <h2>Choose Checkout Options:</h2>
                    <div className={classes['checkout-options']}>
                        <DeliveryOptions />
                        <PickupOptions />
                    </div>
                    <div className={`${classes['order-summary']} ${classes['cart-items-container']}`}>
                        {cart?.items && cart.items.length > 0 ? (
                            cart.items.map((item: CartItem) => <ShoppingCartItem key={item.id} item={item} />)
                        ) : (
                            <p>Your cart is empty.</p>
                        )}
                    </div>
                </div>
                <div id={classes.rightCart}>
                    <div className={`${classes['order-summary']} ${classes.cart_totals}`}>
                        <h2>Order Summary</h2>
                        <div className={`${classes.set_instructions}`}>
                            <span>Checkout Option: </span>
                            <span className={`text-xl text-red-700 ${classes.checkout_option}`}>Pickup</span>
                        </div>
                        <div className={classes.set_instructions}></div>
                        <div className={classes.set_total}>
                            <span className={classes.summary_font}>Total </span>
                            <span className={classes['summary-amount']}>${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShoppingCart;
