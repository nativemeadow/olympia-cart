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

interface CustomerOrdersProps {
    customers: OrdersPaginated<Customer>;
}

export default function CustomerOrders({ customers }: CustomerOrdersProps) {
    const { data, links, prev_page_url, next_page_url } = customers;

    console.log('Customer Orders Data:', customers);

    if (!customers) {
        return (
            <DashboardLayout>
                <Head title="Customer Orders" />
                <div className="px-4 sm:px-6 lg:px-8">
                    <p>Loading...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Head title="Customer Orders" />
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-base leading-6 font-semibold text-gray-900">
                            Customer Orders
                        </h1>
                        <p className="mt-2 text-sm text-gray-700">
                            A list of all the orders from your customers,
                            grouped by customer.
                        </p>
                    </div>
                </div>
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                            >
                                {data.map((customer) => (
                                    <AccordionItem
                                        key={customer.id}
                                        value={`customer-${customer.id}`}
                                    >
                                        <AccordionTrigger>
                                            {customer.first_name}{' '}
                                            {customer.last_name}
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <Accordion
                                                type="single"
                                                collapsible
                                                className="w-full"
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
                                                                <Table>
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
                <Pagination className="mt-4">
                    <PaginationContent>
                        {prev_page_url && (
                            <PaginationItem>
                                <Link href={prev_page_url} preserveScroll>
                                    <PaginationPrevious />
                                </Link>
                            </PaginationItem>
                        )}
                        {links.map((link, index) => {
                            // We only want to render numeric page links
                            if (!isNaN(Number(link.label))) {
                                return (
                                    <PaginationItem key={index}>
                                        <Link href={link.url!} preserveScroll>
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
        </DashboardLayout>
    );
}
