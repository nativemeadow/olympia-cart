import React from 'react';
import { User } from '@/types';
import { Address, Order, OrderItem } from '@/types/model-types';
import { Checkout } from '@/types';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import useCheckoutStore from '@/zustand/checkoutStore';

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
    const { props } = usePage<{ order: Order }>();
    const { order } = props;
    const { setCheckout } = useCheckoutStore();

    // Clear checkout state on confirmation page
    React.useEffect(() => {
        setCheckout(null);
    }, [setCheckout]);

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
                            'Shipping',
                            order.user?.first_name || null,
                            order.user?.email || null,
                        )}
                        {renderAddress(
                            order.billing_address || null,
                            'Billing',
                            order.user?.first_name || null,
                            order.user?.email || null,
                        )}
                    </div>
                    <h3 className="mt-6 text-xl font-semibold">
                        Order Summary
                    </h3>
                    <ul className="mt-2 divide-y divide-gray-200">
                        {order.items?.map((item, index) => (
                            <li key={`item-${index}`} className="flex py-4">
                                <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                            <h3>{item.product?.title}</h3>
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
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 border-t pt-4 text-right">
                        <p className="text-lg font-semibold">
                            Total: ${order.total.toFixed(2)}
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
