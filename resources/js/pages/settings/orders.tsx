import { Head } from '@inertiajs/react';

import { type BreadcrumbItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

import { Order, OrderItem } from '@/types/model-types';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { PageProps } from '@/types';
import classes from './orders.module.css';

const categoryPath = 'categories';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/settings/orders',
    },
];

const Orders = () => {
    // Get the 'orders' data from the page props.
    const { orders } = usePage<PageProps<{ orders: Order[] }>>().props;

    return (
        <>
            {/** <AppLayout breadcrumbs={breadcrumbs}> */}
            <Head title="Your Orders" />

            {/** <SettingsLayout> */}
            <div>
                {orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        You have no orders yet.
                    </p>
                ) : (
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full space-y-4"
                    >
                        {orders.map((order) => (
                            <AccordionItem
                                key={order.id}
                                value={`order-${order.id}`}
                                className="rounded-lg border bg-card text-card-foreground shadow-sm"
                            >
                                <AccordionTrigger className="p-4 text-sm hover:no-underline">
                                    <div className="flex w-full items-center justify-between">
                                        <span className="font-semibold">
                                            Order #{order.id}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                        <span className="font-medium">
                                            ${order.total}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="border-t p-4">
                                    <div className="space-y-3">
                                        {order.items?.map((item: OrderItem) => (
                                            <div
                                                key={item.id}
                                                className={classes.orderItem}
                                            >
                                                <div>
                                                    <Link
                                                        href={`/${categoryPath}/products/${item.category_slug}/${item.product_slug}`}
                                                    >
                                                        <img
                                                            className={
                                                                classes.image
                                                            }
                                                            src={`/products/${item.image}`}
                                                            alt={item.title}
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="ml-4 text-sm">
                                                    <div className="font-medium">
                                                        <Link
                                                            href={`/${categoryPath}/products/${item.category_slug}/${item.product_slug}`}
                                                        >
                                                            {item.title}
                                                        </Link>
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        Qty: {item.quantity} @ $
                                                        {item.price}
                                                        {' / '}
                                                        {item.unit}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        </>
    );
    {
        /* </SettingsLayout>
        </AppLayout> */
    }
};

export default Orders;
