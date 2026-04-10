import DashboardLayout from '@/layouts/dashboard-layout';
import { Head, Link } from '@inertiajs/react';
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

interface CustomerOrdersProps {
    customers: OrdersPaginated<Customer>;
    filters: {
        search: string;
    };
}

export default function CustomerOrders({
    customers,
    filters,
}: CustomerOrdersProps) {
    const { data, links, prev_page_url, next_page_url } = customers;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = () => {
        router.get(
            route('dashboard.customer.orders'),
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
            route('dashboard.customer.orders'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    useEffect(() => {
        // If you want to search as you type, you can call handleSearch here.
        // For now, we'll only search on button click.
    }, [searchTerm]);

    if (!customers) {
        return (
            <DashboardLayout>
                <Head title="Customer Orders" />
                <div className={styles.container}>
                    <p>Loading...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
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
                                            <Accordion
                                                type="single"
                                                collapsible
                                                className={
                                                    styles.orderAccordion
                                                }
                                            >
                                                {customer.orders?.map(
                                                    (order: Order) => (
                                                        <AccordionItem
                                                            key={order.id}
                                                            value={`order-${order.id}`}
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
                                                                <Table
                                                                    className={
                                                                        styles.orderItemsTable
                                                                    }
                                                                >
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead>
                                                                                SKU
                                                                            </TableHead>
                                                                            <TableHead>
                                                                                Product
                                                                            </TableHead>
                                                                            <TableHead>
                                                                                Quantity
                                                                            </TableHead>
                                                                            <TableHead>
                                                                                Price
                                                                            </TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {order.items?.map(
                                                                            (
                                                                                item: OrderItem,
                                                                            ) => (
                                                                                <TableRow
                                                                                    key={
                                                                                        item.id
                                                                                    }
                                                                                >
                                                                                    <TableCell>
                                                                                        {
                                                                                            item.sku
                                                                                        }
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {
                                                                                            item.title
                                                                                        }
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {
                                                                                            item.quantity
                                                                                        }
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        $
                                                                                        {Number(
                                                                                            item.price /
                                                                                                100,
                                                                                        ).toFixed(
                                                                                            2,
                                                                                        )}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ),
                                                                        )}
                                                                    </TableBody>
                                                                </Table>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    ),
                                                )}
                                            </Accordion>
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
                                    <Link href={prev_page_url} preserveScroll>
                                        <PaginationPrevious />
                                    </Link>
                                </PaginationItem>
                            )}
                            {links.map((link, index) => {
                                if (!isNaN(Number(link.label))) {
                                    return (
                                        <PaginationItem key={index}>
                                            <Link
                                                href={link.url!}
                                                preserveScroll
                                            >
                                                <PaginationLink
                                                    isActive={link.active}
                                                >
                                                    {link.label}
                                                </PaginationLink>
                                            </Link>
                                        </PaginationItem>
                                    );
                                }
                                return null;
                            })}
                            {next_page_url && (
                                <PaginationItem>
                                    <Link href={next_page_url} preserveScroll>
                                        <PaginationNext />
                                    </Link>
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </DashboardLayout>
    );
}
