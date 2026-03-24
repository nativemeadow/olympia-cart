import DashboardLayout from '@/layouts/dashboard-layout';
import { Head } from '@inertiajs/react';
import { CategoryHierarchy } from '@/types';
import CategoryNode from './category-node';
import styles from './categories.module.css';
import {
    CategoryExpandedProvider,
    useCategoryExpanded,
} from '@/context/CategoryExpandedContext';
import { Button } from '@/components/ui/button';

type Props = {
    categories: CategoryHierarchy[];
};

function getAllCategoryIds(categories: CategoryHierarchy[]): number[] {
    let ids: number[] = [];
    for (const category of categories) {
        ids.push(category.id);
        if (category.children) {
            ids = ids.concat(getAllCategoryIds(category.children));
        }
    }
    return ids;
}

function CategoryActions({ categories }: Props) {
    const { expandAll, collapseAll } = useCategoryExpanded();
    const allIds = getAllCategoryIds(categories);

    return (
        <div className={styles.toolbar}>
            <Button onClick={() => expandAll(allIds)} variant="outline">Expand All</Button>
            <Button onClick={collapseAll} variant="outline">
                Collapse All
            </Button>
        </div>
    );
}

export default function Categories({ categories }: Props) {
    return (
        <DashboardLayout>
            <Head title="Categories" />
            <CategoryExpandedProvider>
                <div className={styles.headerContainer}>
                    <div>
                        <h1 className={styles.title}>Manage Categories</h1>
                        <p className={styles.description}>
                            This is where you will add, edit, and delete
                            product categories.
                        </p>
                    </div>
                    <CategoryActions categories={categories} />
                </div>
                <div className={styles.container}>
                    {categories.map((category) => (
                        <CategoryNode key={category.id} category={category} />
                    ))}
                </div>
            </CategoryExpandedProvider>
        </DashboardLayout>
    );
}
