import DashboardLayout from '@/layouts/dashboard-layout';
import {
    Customer,
    Order,
    OrderItem,
    Cart,
    CartItem,
    User,
} from '@/types/model-types';
import { OrdersPaginated } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import styles from './customers.module.css';
import { ImSpinner } from 'react-icons/im';

function CustomerOrders({ customer }: { customer: Customer }) {
    if (!customer.orders || customer.orders.length === 0) {
        return '0';
    }
    return (
        <Table className={styles.ordersTable}>
            <TableHeader>
                <TableRow>
                    <TableCell className={styles.tableHeaderCell}>
                        Order ID
                    </TableCell>
                    <TableCell className={styles.tableHeaderCell}>
                        Total
                    </TableCell>
                    <TableCell className={styles.tableHeaderCell}>
                        Status
                    </TableCell>
                    <TableCell className={styles.tableHeaderCell}>
                        Date
                    </TableCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {customer.orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className={styles.tableBodyCell}>
                            {order.id}
                        </TableCell>
                        <TableCell className={styles.tableBodyCell}>
                            ${(order.total / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className={styles.tableBodyCell}>
                            {order.status}
                        </TableCell>
                        <TableCell className={styles.tableBodyCell}>
                            {order.status === 'pending'
                                ? new Date(
                                      order.created_at,
                                  ).toLocaleDateString()
                                : new Date(
                                      order.updated_at,
                                  ).toLocaleDateString()}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function CustomerCarts({ customer }: { customer: Customer }) {
    const [openCartIds, setOpenCartIds] = useState<number[]>([]);

    if (!customer.carts || customer.carts.length === 0) {
        return '0';
    }

    const handleOpenCloseCart = (cartId: number) => {
        setOpenCartIds((prev) =>
            prev.includes(cartId)
                ? prev.filter((id) => id !== cartId)
                : [...prev, cartId],
        );
    };

    return (
        <Table className={styles.ordersTable}>
            <TableHeader>
                <TableRow>
                    <TableCell className={styles.tableHeaderCell}>
                        Cart ID
                    </TableCell>
                    <TableCell className={styles.tableHeaderCell}>
                        Total
                    </TableCell>
                    <TableCell className={styles.tableHeaderCell}>
                        Status
                    </TableCell>
                    <TableCell className={styles.tableHeaderCell}>
                        Date
                    </TableCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {customer.carts.map((cart) => (
                    <>
                        <TableRow key={cart.id}>
                            <TableCell className={styles.tableBodyCell}>
                                {cart.id}
                            </TableCell>
                            <TableCell className={styles.tableBodyCell}>
                                ${(cart.total / 100).toFixed(2)}
                            </TableCell>
                            <TableCell className={styles.tableBodyCell}>
                                {cart.status}
                            </TableCell>
                            <TableCell className={styles.tableBodyCell}>
                                {cart.status === 'pending'
                                    ? new Date(
                                          cart.created_at,
                                      ).toLocaleDateString()
                                    : new Date(
                                          cart.updated_at,
                                      ).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={3} className="p-0">
                                <Collapsible
                                    open={openCartIds.includes(cart.id)}
                                    onOpenChange={() =>
                                        handleOpenCloseCart(cart.id)
                                    }
                                >
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant="link"
                                            className={styles.viewCartButton}
                                        >
                                            View Cart Items
                                            {openCartIds.includes(cart.id) ? (
                                                <ChevronDown
                                                    className={
                                                        styles.chevron_icon
                                                    }
                                                />
                                            ) : (
                                                <ChevronRight
                                                    className={
                                                        styles.chevron_icon
                                                    }
                                                />
                                            )}
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <Table
                                            className={styles.cartItemsTable}
                                        >
                                            <TableHeader>
                                                <TableRow>
                                                    <TableCell
                                                        className={
                                                            styles.tableHeaderCell
                                                        }
                                                    >
                                                        SKU
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            styles.tableHeaderCell
                                                        }
                                                    >
                                                        Product
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            styles.tableHeaderCell
                                                        }
                                                    >
                                                        Quantity
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            styles.tableHeaderCell
                                                        }
                                                    >
                                                        Price
                                                    </TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {cart.items &&
                                                cart.items.length > 0 ? (
                                                    cart.items.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell
                                                                className={
                                                                    styles.tableBodyCell
                                                                }
                                                            >
                                                                {item.sku}
                                                            </TableCell>
                                                            <TableCell
                                                                className={
                                                                    styles.tableBodyCell
                                                                }
                                                            >
                                                                {item.title}
                                                            </TableCell>
                                                            <TableCell
                                                                className={
                                                                    styles.tableBodyCell
                                                                }
                                                            >
                                                                {item.quantity}{' '}
                                                                {item.unit}
                                                            </TableCell>
                                                            <TableCell
                                                                className={
                                                                    styles.tableBodyCell
                                                                }
                                                            >
                                                                $
                                                                {(
                                                                    item.price /
                                                                    100
                                                                ).toFixed(2)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={3}
                                                            className={
                                                                styles.tableBodyCell
                                                            }
                                                        >
                                                            No items in this
                                                            cart.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CollapsibleContent>
                                </Collapsible>
                            </TableCell>
                        </TableRow>
                    </>
                ))}
            </TableBody>
        </Table>
    );
}

type CustomersProps = {
    customers: OrdersPaginated<Customer>;
    filters: {
        search: string;
    };
    auth: {
        user: User;
    };
};

export default function Customers({
    customers,
    filters,
    auth,
}: CustomersProps) {
    const { data, links, prev_page_url, next_page_url } = customers;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [openCustomerIds, setOpenCustomerIds] = useState<number[]>([]);
    const [openCartCustomerIds, setOpenCartCustomerIds] = useState<number[]>(
        [],
    );

    const handleSearch = () => {
        router.get(
            route('dashboard.customers'),
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
            route('dashboard.customers'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Toggle the open state of the order history for a specific customer
    const handleOpenCloseOrderHistory = (customerId: number) => {
        setOpenCustomerIds((prev) =>
            // If the customer ID is already in the openCustomerIds array,
            // remove it (close the order history)
            prev.includes(customerId)
                ? prev.filter((id) => id !== customerId)
                : [...prev, customerId],
        );
    };

    const handleOpenCloseCartDetails = (customerId: number) => {
        setOpenCartCustomerIds((prev) =>
            // If the customer ID is already in the openCartCustomerIds array,
            // remove it (close the cart details)
            prev.includes(customerId)
                ? prev.filter((id) => id !== customerId)
                : [...prev, customerId],
        );
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Customers" />
            <h1 className={styles.title}>Manage Customers</h1>
            <p className={styles.subtitle}>
                This is where you will view customer information and order
                history.
            </p>
            <div className={styles.searchContainer}>
                <Input
                    type="text"
                    placeholder="Search by customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
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
            <div className={styles.table_container}>
                <Table className={styles.customer_table}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={styles.status_col}>
                                Status
                            </TableHead>
                            <TableHead className={styles.name_col}>
                                Name
                            </TableHead>
                            <TableHead className={styles.email_col}>
                                Email
                            </TableHead>
                            <TableHead className={styles.orders_col}>
                                Total Orders
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((customer) => (
                            <Fragment key={customer.id}>
                                <TableRow>
                                    <TableCell>
                                        {customer.user_id ? (
                                            <span
                                                className={`${styles.status_badge} ${styles.registered_badge}`}
                                            >
                                                Registered
                                            </span>
                                        ) : (
                                            <span
                                                className={`${styles.status_badge} ${styles.guest_badge}`}
                                            >
                                                Guest
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell
                                        className={styles.customer_details}
                                    >
                                        {customer.first_name}{' '}
                                        {customer.last_name}
                                    </TableCell>
                                    <TableCell
                                        className={styles.customer_details}
                                    >
                                        {customer.email}
                                    </TableCell>
                                    <TableCell
                                        className={styles.customer_details}
                                    ></TableCell>
                                </TableRow>
                                {customer.orders &&
                                    customer.orders.length > 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="p-0"
                                            >
                                                <Collapsible
                                                    open={openCustomerIds.includes(
                                                        customer.id,
                                                    )}
                                                    onOpenChange={() =>
                                                        handleOpenCloseOrderHistory(
                                                            customer.id,
                                                        )
                                                    }
                                                >
                                                    <CollapsibleTrigger
                                                        asChild
                                                        className="w-full"
                                                    >
                                                        <div
                                                            className={
                                                                styles.order_history_header
                                                            }
                                                        >
                                                            View Order History
                                                            {openCustomerIds.includes(
                                                                customer.id,
                                                            ) ? (
                                                                <ChevronDown
                                                                    className={
                                                                        styles.chevron_icon
                                                                    }
                                                                />
                                                            ) : (
                                                                <ChevronRight
                                                                    className={
                                                                        styles.chevron_icon
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent
                                                        className={
                                                            styles.collapsibleContent
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.collapsibleContent
                                                            }
                                                        >
                                                            <h3
                                                                className={
                                                                    styles.orderHistoryTitle
                                                                }
                                                            >
                                                                Order History
                                                            </h3>
                                                            <CustomerOrders
                                                                customer={
                                                                    customer as Customer
                                                                }
                                                            />
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                {customer.carts &&
                                    customer.carts.length > 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="p-0"
                                            >
                                                <Collapsible
                                                    open={openCartCustomerIds.includes(
                                                        customer.id,
                                                    )}
                                                    onOpenChange={() =>
                                                        handleOpenCloseCartDetails(
                                                            customer.id,
                                                        )
                                                    }
                                                >
                                                    <CollapsibleTrigger
                                                        asChild
                                                        className="w-full"
                                                    >
                                                        <div
                                                            className={
                                                                styles.order_history_header
                                                            }
                                                        >
                                                            View Cart Details
                                                            {openCartCustomerIds.includes(
                                                                customer.id,
                                                            ) ? (
                                                                <ChevronDown
                                                                    className={
                                                                        styles.chevron_icon
                                                                    }
                                                                />
                                                            ) : (
                                                                <ChevronRight
                                                                    className={
                                                                        styles.chevron_icon
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent
                                                        className={
                                                            styles.collapsibleContent
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.collapsibleContent
                                                            }
                                                        >
                                                            <h3
                                                                className={
                                                                    styles.orderHistoryTitle
                                                                }
                                                            >
                                                                Cart Details
                                                            </h3>
                                                            <CustomerCarts
                                                                customer={
                                                                    customer as Customer
                                                                }
                                                            />
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                <TableRow className={styles.dividerRow}>
                                    <TableCell colSpan={4} className="p-0">
                                        <Separator
                                            className={styles.separator}
                                        />
                                    </TableCell>
                                </TableRow>
                            </Fragment>
                        ))}
                    </TableBody>
                </Table>
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
            {/* <pre className={styles.debugPre}>
                {JSON.stringify(customers, null, 2)}
            </pre> */}
        </DashboardLayout>
    );
}
