import DashboardLayout from '@/layouts/dashboard-layout';
import { Head } from '@inertiajs/react';

function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">
                    Dashboard Overview
                </h1>
            </div>
            <div
                className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
                x-chunk="dashboard-02-chunk-1"
            >
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Dashboard Content Goes Here
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        You can add stat cards, charts, and recent activity.
                    </p>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);

export default Dashboard;
