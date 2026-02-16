import DashboardLayout from '@/layouts/dashboard-layout';
import { Head } from '@inertiajs/react';
import { CategoryHierarchy } from '@/types';
import CategoryNode from './category-node';
import styles from './categories.module.css';

type Props = {
    categories: CategoryHierarchy[];
};

export default function Categories({ categories }: Props) {
    return (
        <DashboardLayout>
            <Head title="Categories" />
            <h1 className={styles.title}>Manage Categories</h1>
            <p className={styles.description}>
                This is where you will add, edit, and delete product categories.
            </p>
            <div className={styles.container}>
                {categories.map((category) => (
                    <CategoryNode key={category.id} category={category} />
                ))}
            </div>
        </DashboardLayout>
    );
}
