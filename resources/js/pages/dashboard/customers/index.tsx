import DashboardLayout from '@/layouts/dashboard-layout';
import { Customer } from '@/types/model-types';
import { Head } from '@inertiajs/react';
import styles from './customers.module.css';

function customerOrders(customer: Customer) {
    if (!customer.orders || customer.orders.length === 0) {
        return '0';
    }
    return (
        <table className="w-full table-auto border-collapse">
            <thead>
                <tr>
                    <th className="border-b px-4 py-2 text-left text-sm font-semibold text-muted-foreground">
                        Order ID
                    </th>
                    <th className="border-b px-4 py-2 text-left text-sm font-semibold text-muted-foreground">
                        Total
                    </th>
                    <th className="border-b px-4 py-2 text-left text-sm font-semibold text-muted-foreground">
                        Status
                    </th>
                </tr>
            </thead>
            <tbody>
                {customer.orders.map((order) => (
                    <tr key={order.id}>
                        <td className="border-b px-4 py-2">{order.id}</td>
                        <td className="border-b px-4 py-2">
                            ${(order.total / 100).toFixed(2)}
                        </td>
                        <td className="border-b px-4 py-2">{order.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

type CustomersProps = {
    customers: Customer[];
};

export default function Customers({ customers }: CustomersProps) {
    return (
        <DashboardLayout>
            <Head title="Customers" />
            <h1 className="text-lg font-semibold md:text-2xl">
                Manage Customers
            </h1>
            <p className="text-sm text-muted-foreground">
                This is where you will view customer information and order
                history.
            </p>
            <div className={styles.table_container}>
                <table className={styles.customer_table}>
                    <thead>
                        <tr>
                            <th className={styles.status_col}></th>
                            <th className={styles.name_col}>Name</th>
                            <th className={styles.email_col}>Email</th>
                            <th className={styles.orders_col}>Total Orders</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id}>
                                <td>
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
                                </td>
                                <td>
                                    {customer.first_name} {customer.last_name}
                                </td>
                                <td>{customer.email}</td>
                                <td></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <pre className="mt-4 rounded-lg bg-gray-100 p-4">
                {JSON.stringify(customers, null, 2)}
            </pre>
        </DashboardLayout>
    );
}
