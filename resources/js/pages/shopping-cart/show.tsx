import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import DeliveryOptions from '@/components/checkout/delivery-options';
import PickupOptions from '@/components/checkout/pickup-options';
import useCheckoutStore from '@/zustand/checkoutStore';
import { Cart, CartItem } from '@/types/model-types';
import { type Checkout } from '@/types';
import ShoppingCartItem from '@/components/shopping-cart';
import { Button } from '@/components/ui/button';

import classes from './cart.module.css';

type Props = {
    cart: Cart;
    checkout?: Checkout;
};

const ShoppingCart = ({ cart, checkout }: Props) => {
    const [cartTotal, setCartTotal] = useState(cart ? cart.total : 0);
    const { setCheckout, getFormattedDate, getFormattedTime } =
        useCheckoutStore();

    useEffect(() => {
        if (cart) {
            setCartTotal(cart.total);
        }
        // Sync the checkout data from props with the Zustand store
        setCheckout(checkout || null);
    }, [cart]);

    function handleCheckout() {
        router.get(route('checkout-cart.index'));
    }

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
                    <div
                        className={`${classes['order-summary']} ${classes['cart-items-container']}`}
                    >
                        {cart?.items && cart.items.length > 0 ? (
                            cart.items.map((item: CartItem) => (
                                <ShoppingCartItem key={item.id} item={item} />
                            ))
                        ) : (
                            <p>Your cart is empty.</p>
                        )}
                    </div>
                </div>
                <div id={classes.rightCart}>
                    <div
                        className={`${classes['order-summary']} ${classes.cart_totals}`}
                    >
                        <h5>Order Summary</h5>
                        <div className={`${classes.set_instructions}`}>
                            <span>Checkout Option: </span>
                            <span
                                className={`text-xl text-red-700 ${classes.checkout_option}`}
                            >
                                {checkout?.is_pickup
                                    ? 'In Store Pickup'
                                    : checkout?.is_delivery
                                      ? 'Delivery'
                                      : 'N/A'}
                            </span>
                        </div>
                        <div className={classes.set_instructions}>
                            {checkout && (
                                <>
                                    <span>
                                        {checkout.is_pickup
                                            ? 'Pickup Date:'
                                            : checkout.is_delivery
                                              ? 'Delivery Date:'
                                              : ' '}
                                    </span>
                                    <span>{getFormattedDate()}</span>
                                </>
                            )}
                        </div>
                        {checkout?.is_pickup && checkout.pickup_time ? (
                            <div className={classes.set_instructions}>
                                <span>Pickup Time:</span>
                                <span>{getFormattedTime()}</span>
                            </div>
                        ) : checkout?.is_delivery ? (
                            <div className={classes.set_instructions}>
                                <span>Instructions:</span>
                                <span>{checkout.instructions}</span>
                            </div>
                        ) : null}
                        <div className={classes.dividers} />
                        <div className={classes.set_total}>
                            <span className={classes.summary_font}>Total </span>
                            <span className={classes.summary_font}>
                                ${cartTotal.toFixed(2)}
                            </span>
                        </div>
                        <div className={classes.dividers} />
                        <div className="mt-5 w-full">
                            {checkout &&
                            (checkout.is_pickup ||
                                (checkout.is_delivery &&
                                    cart?.items &&
                                    cart.items.length > 0)) ? (
                                <Button
                                    onClick={handleCheckout}
                                    color="primary"
                                    className={`h-12 w-full rounded bg-yellow-700 text-xl text-white transition-all duration-200 hover:bg-yellow-800`}
                                >
                                    Proceed to Checkout
                                </Button>
                            ) : (
                                <p className="mt-2 text-sm text-red-500">
                                    Please select a pickup or delivery option to
                                    continue
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShoppingCart;
