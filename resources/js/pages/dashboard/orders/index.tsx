import DashboardLayout from '@/layouts/dashboard-layout';
import { Head } from '@inertiajs/react';

export default function Orders() {
    return (
        <DashboardLayout>
            <Head title="Orders" />
            <h1 className="text-lg font-semibold md:text-2xl">Manage Orders</h1>
            <p className="text-sm text-muted-foreground">
                This is where you will view and process customer orders.
            </p>
        </DashboardLayout>
    );
}
