import DashboardLayout from '@/layouts/dashboard-layout';
import { Head } from '@inertiajs/react';

export default function Users() {
    return (
        <DashboardLayout>
            <Head title="Admin Users" />
            <h1 className="text-lg font-semibold md:text-2xl">
                Manage Admin Users
            </h1>
            <p className="text-sm text-muted-foreground">
                This is where you will manage users with administrative access
                and roles.
            </p>
        </DashboardLayout>
    );
}
