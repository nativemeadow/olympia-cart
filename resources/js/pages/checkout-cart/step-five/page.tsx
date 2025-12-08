import React, { useEffect, useState } from 'react';
import { User } from '@/types';
import axios from 'axios';
import { Address, CustomerData, Order, OrderItem } from '@/types/model-types';
import { Checkout } from '@/types';
import parse from 'html-react-parser';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import useCheckoutStore from '@/zustand/checkoutStore';
import { Skeleton } from '@/components/ui/skeleton';

import classes from './step-five.module.css';

const renderAddress = (
    address: Address | null,
    title: string,
    name?: string | null, // Optional name from guestDetails
    email?: string | null, // Optional email from guestDetails
) => {
    if (!address)
        return <p>No {title.toLowerCase()} address details available.</p>;

    return (
        <Card className="mb-4">
            <CardHeader>
                <h2 className="text-xl font-semibold">{title} Address</h2>
            </CardHeader>
            <CardContent>
                {name && <p>{name}</p>}
                {email && <p className="text-sm text-gray-500">{email}</p>}
                <p>{address.street1}</p>
                {address.street2 && <p>{address.street2}</p>}
                <p>
                    {address.city}, {address.state} {address.zip}
                </p>
                {address.phone && <p>Phone: {address.phone}</p>}
            </CardContent>
        </Card>
    );
};

const StepFive = () => {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { setCheckout } = useCheckoutStore();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/order/confirmation');
                if (response.data.order) {
                    setOrder(response.data.order);
                } else {
                    setError('Could not find your order.');
                }
            } catch (err) {
                setError('An error occurred while fetching your order.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, []);

    useEffect(() => {
        // Clear checkout state on confirmation page
        setCheckout(null);
    }, [setCheckout]);

    function calculateTotal(items: OrderItem[]): number {
        return items.reduce(
            (total, item) => total + item.price * item.quantity,
            0,
        );
    }

    if (loading) {
        return (
            <div>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="mt-4 h-64 w-full" />
            </div>
        );
    }

    if (error || !order) {
        return <p className="text-red-500">{error || 'Order not found.'}</p>;
    }
    return (
        <>
            <h1 className="text-2xl font-semibold">
                Step 5: Order Confirmation
            </h1>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-3xl text-green-600">
                        Thank you for your order!
                    </CardTitle>
                    <CardDescription>
                        Your order has been placed successfully. An email
                        confirmation has been sent to you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-lg">
                        <strong>Order Number:</strong> {order.id}
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {renderAddress(
                            order.billing_address || null,
                            'Shipping', // This should be shipping_address, but it's not in the API response
                            order.user?.first_name +
                                ' ' +
                                order.user?.last_name ||
                                order.guest_name ||
                                null,
                            order.user?.email || null,
                        )}
                        {renderAddress(
                            order.billing_address || null,
                            'Billing',
                            order.user?.first_name +
                                ' ' +
                                order.user?.last_name ||
                                order.guest_name ||
                                null,
                            order.user?.email || null,
                        )}
                    </div>
                    <h3 className="mt-6 text-xl font-semibold">
                        Order Summary
                    </h3>
                    <ul className="mt-2 divide-y divide-gray-200">
                        {order.items?.map((item, index) => (
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
                                <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>{parse(item?.title)}</h3>
                                        <p className="ml-4">
                                            $
                                            {(
                                                item.price * item.quantity
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                    <p className="text-gray-500">
                                        Qty {item.quantity}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </ul>
                    <div className="mt-4 border-t pt-4 text-right">
                        <p className="text-lg font-semibold">
                            Total:{' '}
                            <span className="ml-4">
                                ${calculateTotal(order.items || []).toFixed(2)}
                            </span>
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Link href="/">
                        <Button>Continue Shopping</Button>
                    </Link>
                </CardFooter>
            </Card>
        </>
    );
};

export default StepFive;
