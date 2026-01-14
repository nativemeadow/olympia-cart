import DashboardLayout from '@/layouts/dashboard-layout';
import { Head } from '@inertiajs/react';
import { CategoryHierarchy } from '@/types';

type Props = {
    categories: CategoryHierarchy[];
};

export default function Categories({ categories }: Props) {
    return (
        <DashboardLayout>
            <Head title="Categories" />
            <h1 className="text-lg font-semibold md:text-2xl">
                Manage Categories
            </h1>
            <p className="text-sm text-muted-foreground">
                This is where you will add, edit, and delete product categories.
            </p>
            {/* You can now map over the 'categories' prop here */}
            <pre className="mt-4 rounded-lg bg-gray-100 p-4">
                {JSON.stringify(categories, null, 2)}
            </pre>
        </DashboardLayout>
    );
}
