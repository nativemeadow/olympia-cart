import DashboardLayout from '@/layouts/dashboard-layout';
import { Head, usePage } from '@inertiajs/react';
import { OrdersPaginated } from '@/types';
import { Customer, Order, OrderItem } from '@/types/model-types';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import styles from './orders.module.css';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { User } from '@/types/model-types';

interface CustomerOrdersProps {
    customers: OrdersPaginated<Customer>;
    filters: {
        search: string;
    };
}

type PageProps = {
    auth: {
        user: User;
    };
};

const OrderDetails = ({
    order: initialOrder,
    isLoaded,
}: {
    order: Order;
    isLoaded: boolean;
}) => {
    if (!isLoaded) {
        return null; // Don't render anything until details are loaded
    }

    const hasPayment = initialOrder.checkout?.payment;
    const hasItems = initialOrder.items && initialOrder.items.length > 0;

    if (!hasPayment && !hasItems) {
        return <div>No order details or payment information available.</div>;
    }

    return (
        <div>
            {hasPayment ? (
                <div className={styles.paymentDetails}>
                    <h4 className={styles.detailsTitle}>Payment Details</h4>
                    <p>
                        <strong>Amount:</strong> $
                        {initialOrder.checkout?.payment?.amount !== undefined
                            ? (
                                  initialOrder.checkout.payment.amount / 100
                              ).toFixed(2)
                            : ''}
                    </p>
                    <p>
                        <strong>Status:</strong>{' '}
                        {initialOrder.checkout?.payment?.status ?? ''}
                    </p>
                    <p>
                        <strong>Gateway:</strong>{' '}
                        {initialOrder.checkout?.payment?.payment_gateway ?? ''}
                    </p>
                </div>
            ) : (
                <div className={styles.paymentDetails}>
                    <h4 className={styles.detailsTitle}>Payment Details</h4>
                    <p>No payment information available.</p>
                </div>
            )}
            {hasItems ? (
                <>
                    <h4 className={styles.detailsTitle}>Order Items</h4>
                    <Table className={styles.orderItemsTable}>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SKU</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialOrder.items &&
                                initialOrder.items.map((item: OrderItem) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.sku}</TableCell>
                                        <TableCell>{item.title}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>
                                            $
                                            {Number(item.price / 100).toFixed(
                                                2,
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </>
            ) : (
                <>
                    <h4 className={styles.detailsTitle}>Order Items</h4>
                    <p>No items in this order.</p>
                </>
            )}
        </div>
    );
};

export default function CustomerOrders({
    customers,
    filters,
}: CustomerOrdersProps) {
    const { auth } = usePage<PageProps>().props;
    const { data, links, prev_page_url, next_page_url } = customers;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [orderDetails, setOrderDetails] = useState<{ [key: number]: Order }>(
        {},
    );
    const [customerOrders, setCustomerOrders] = useState<{
        [key: number]: Order[];
    }>({});
    const [loadingOrder, setLoadingOrder] = useState<number | null>(null);
    const [loadingCustomer, setLoadingCustomer] = useState<number | null>(null);

    const handleSearch = () => {
        router.get(
            route('dashboard.orders'),
            { search: searchTerm },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleClear = () => {
        setSearchTerm('');
        router.get(
            route('dashboard.orders'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleAccordionChange = async (orderId: number) => {
        if (orderDetails[orderId] || loadingOrder === orderId) {
            return;
        }

        setLoadingOrder(orderId);
        try {
            const response = await fetch(
                route('dashboard.orders.details', { order: orderId }),
            );
            const data: Order = await response.json();
            setOrderDetails((prev) => ({ ...prev, [orderId]: data }));
        } catch (error) {
            console.error('Failed to fetch order details:', error);
        } finally {
            setLoadingOrder(null);
        }
    };

    const handleCustomerAccordionChange = async (customerId: number) => {
        if (customerOrders[customerId] || loadingCustomer === customerId) {
            return;
        }

        setLoadingCustomer(customerId);
        try {
            const response = await fetch(
                route('dashboard.orders.customer', { customer: customerId }),
            );
            const data: Order[] = await response.json();
            setCustomerOrders((prev) => ({ ...prev, [customerId]: data }));
        } catch (error) {
            console.error('Failed to fetch customer orders:', error);
        } finally {
            setLoadingCustomer(null);
        }
    };

    useEffect(() => {
        // If you want to search as you type, you can call handleSearch here.
        // For now, we'll only search on button click.
    }, [searchTerm]);

    if (!customers) {
        return (
            <DashboardLayout user={auth.user as User}>
                <Head title="Customer Orders" />
                <div className={styles.container}>
                    <p>Loading...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout user={auth.user as User}>
            <Head title="Customer Orders" />
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>Customer Orders</h1>
                        <p className={styles.description}>
                            A list of all the orders from your customers,
                            grouped by customer.
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder="Search by customer name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button onClick={handleSearch}>
                        <Search className={styles.buttonSize} />
                    </Button>
                    {searchTerm && (
                        <Button
                            variant="outline"
                            onClick={handleClear}
                            className={styles.clearButton}
                        >
                            <X className={styles.buttonSize} />
                        </Button>
                    )}
                </div>

                <div className={styles.contentWrapper}>
                    <div className={styles.tableContainer}>
                        <div className={styles.tableWrapper}>
                            <Accordion
                                type="single"
                                collapsible
                                className={styles.customerAccordion}
                            >
                                {data.map((customer) => (
                                    <AccordionItem
                                        key={customer.id}
                                        value={`customer-${customer.id}`}
                                        onClick={() =>
                                            handleCustomerAccordionChange(
                                                customer.id,
                                            )
                                        }
                                    >
                                        <AccordionTrigger>
                                            <div
                                                className={
                                                    styles.customerTrigger
                                                }
                                            >
                                                <Badge
                                                    className={
                                                        customer.user_id
                                                            ? styles.registered_badge
                                                            : styles.guest_badge
                                                    }
                                                >
                                                    {customer.user_id
                                                        ? 'Registered'
                                                        : 'Guest'}
                                                </Badge>
                                                <span
                                                    className={
                                                        styles.customerName
                                                    }
                                                >
                                                    {customer.first_name}{' '}
                                                    {customer.last_name}
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            {loadingCustomer === customer.id ? (
                                                <div>Loading orders...</div>
                                            ) : customerOrders[customer.id] &&
                                              customerOrders[customer.id]
                                                  .length > 0 ? (
                                                <Accordion
                                                    type="single"
                                                    collapsible
                                                    className={
                                                        styles.orderAccordion
                                                    }
                                                >
                                                    {customerOrders[
                                                        customer.id
                                                    ]?.map((order: Order) => (
                                                        <AccordionItem
                                                            key={order.id}
                                                            value={`order-${order.id}`}
                                                            onClick={() =>
                                                                handleAccordionChange(
                                                                    order.id,
                                                                )
                                                            }
                                                        >
                                                            <AccordionTrigger>
                                                                Order #
                                                                {order.id}
                                                                {' - '}
                                                                {new Date(
                                                                    order.created_at,
                                                                ).toLocaleDateString()}
                                                                {' - '}
                                                                {order.status} -
                                                                $
                                                                {Number(
                                                                    order.total /
                                                                        100,
                                                                ).toFixed(2)}
                                                            </AccordionTrigger>
                                                            <AccordionContent>
                                                                {loadingOrder ===
                                                                order.id ? (
                                                                    <div>
                                                                        Loading...
                                                                    </div>
                                                                ) : (
                                                                    <OrderDetails
                                                                        order={
                                                                            orderDetails[
                                                                                order
                                                                                    .id
                                                                            ] ||
                                                                            order
                                                                        }
                                                                        isLoaded={
                                                                            !!orderDetails[
                                                                                order
                                                                                    .id
                                                                            ]
                                                                        }
                                                                    />
                                                                )}
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    ))}
                                                </Accordion>
                                            ) : (
                                                <div>
                                                    No orders for this customer.
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </div>
                <div className={styles.pagination}>
                    <Pagination>
                        <PaginationContent>
                            {prev_page_url && (
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() =>
                                            router.visit(prev_page_url, {
                                                preserveScroll: true,
                                            })
                                        }
                                    />
                                </PaginationItem>
                            )}
                            {links.map((link, index) => {
                                if (!isNaN(Number(link.label))) {
                                    return (
                                        <PaginationItem
                                            key={index}
                                            onClick={() =>
                                                router.visit(link.url!, {
                                                    preserveScroll: true,
                                                })
                                            }
                                        >
                                            <PaginationLink
                                                isActive={link.active}
                                            >
                                                {link.label}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                }
                                return null;
                            })}
                            {next_page_url && (
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() =>
                                            router.visit(next_page_url, {
                                                preserveScroll: true,
                                            })
                                        }
                                    />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </DashboardLayout>
    );
}
