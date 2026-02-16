import DashboardLayout from '@/layouts/dashboard-layout';
import { Head } from '@inertiajs/react';
import { CategoryHierarchy } from '@/types';
import ProductNode from './product-node';
import styles from './products.module.css';

type CategoriesIndexProps = {
    categories: CategoryHierarchy[];
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
            <div className={styles.container}>
                {categories.map((category) => (
                    <ProductNode key={category.id} category={category} />
                ))}
            </div>
        </DashboardLayout>
    );
}
