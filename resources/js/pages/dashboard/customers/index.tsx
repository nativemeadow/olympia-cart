import DashboardLayout from '@/layouts/dashboard-layout';
import { Head } from '@inertiajs/react';

export default function Customers() {
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
        </DashboardLayout>
    );
}
