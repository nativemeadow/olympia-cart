import DashboardLayout from '@/layouts/dashboard-layout';
import { Head } from '@inertiajs/react';
import { Category } from '@/types/model-types';

type CategoriesIndexProps = {
    categories: Category[];
};

export default function Products({ categories }: CategoriesIndexProps) {
    return (
        <DashboardLayout>
            <Head title="Products" />
            <h1 className="text-lg font-semibold md:text-2xl">
                Manage Products
            </h1>
            <p className="text-sm text-muted-foreground">
                This is where you will manage your product catalog and
                inventory.
            </p>
            {/* You can now map over the 'categories' prop here */}
            <pre className="mt-4 rounded-lg bg-gray-100 p-4">
                {JSON.stringify(categories, null, 2)}
            </pre>
        </DashboardLayout>
    );
}
