import React from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import { User, Order } from '@/types/model-types';
import { Head, usePage } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Stats = {
    revenue: {
        today: number;
        week: number;
        month: number;
    };
    orders: {
        today: number;
        week: number;
        month: number;
    };
    customers: {
        total: number;
        new_this_month: number;
    };
};

type PageProps = {
    auth: {
        user: User;
    };
    stats: Stats;
    recentOrders: Order[];
};

function Dashboard({ auth, stats, recentOrders }: PageProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount / 100);
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">
                    Dashboard Overview
                </h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue</CardTitle>
                        <CardDescription>
                            Total revenue from completed sales.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats.revenue.month)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(stats.revenue.today)} today
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(stats.revenue.week)} this week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Orders</CardTitle>
                        <CardDescription>Total orders placed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.orders.month}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.orders.today} today
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {stats.orders.week} this week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Customers</CardTitle>
                        <CardDescription>
                            Total and new customers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.customers.total}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +{stats.customers.new_this_month} this month
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-6">
                <h2 className="text-lg font-semibold">Recent Orders</h2>
                <Card className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">
                                    Amount
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <div className="font-medium">
                                            {order.customer?.first_name}{' '}
                                            {order.customer?.last_name}
                                        </div>
                                        <div className="hidden text-sm text-muted-foreground md:inline">
                                            {order.customer?.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>{order.status}</TableCell>
                                    <TableCell>
                                        {new Date(
                                            order.created_at,
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(order.total)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => {
    const { auth, stats, recentOrders } = usePage<PageProps>().props;
    return (
        <DashboardLayout user={auth.user}>
            <Dashboard auth={auth} stats={stats} recentOrders={recentOrders} />
        </DashboardLayout>
    );
};

export default Dashboard;
