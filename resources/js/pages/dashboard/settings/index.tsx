import DashboardLayout from '@/layouts/dashboard-layout';
import { Head } from '@inertiajs/react';

export default function Settings() {
    return (
        <DashboardLayout>
            <Head title="Site Settings" />
            <h1 className="text-lg font-semibold md:text-2xl">Site Settings</h1>
            <p className="text-sm text-muted-foreground">
                This is where you will manage site-wide settings like shipping
                options and taxes.
            </p>
        </DashboardLayout>
    );
}
