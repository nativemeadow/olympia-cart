import DashboardLayout from '@/layouts/dashboard-layout';
import { Head, router } from '@inertiajs/react';
import { CategoryHierarchy } from '@/types';
import { Product as ProductType, User } from '@/types/model-types';
import ProductNode from './product-node';
import classes from './products.module.css';
import { useState, useEffect } from 'react';
import { useProductTreeStore } from '@/zustand/product-tree-store';
import { Button } from '@/components/ui/button';
import Toastify from 'toastify-js';

type CategoriesIndexProps = {
    categories: CategoryHierarchy[];
    auth: {
        user: User;
    };
};

export default function Products({ categories, auth }: CategoriesIndexProps) {
    const { expandAll, collapseAll, activeCategoryId, setActiveCategoryId } =
        useProductTreeStore();

    // This effect runs when the page reloads after a product is saved
    useEffect(() => {
        if (activeCategoryId) {
            const element = document.getElementById(
                `category-${activeCategoryId}`,
            );
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Reset the active ID so this doesn't run on every render
                setActiveCategoryId(null);
            }
        }
    }, [activeCategoryId, categories]); // Rerun when categories data changes

    const handleProductOrderChange = async (
        categoryId: number,
        products: ProductType[],
    ) => {
        const product_order = products.map((product, index) => ({
            product_id: product.id,
            product_order: index,
        }));

        try {
            const response = await fetch(route('dashboard.products.order'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content,
                },
                body: JSON.stringify({
                    category_id: categoryId,
                    products: product_order,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to reorder products.');
            }
        } catch (error) {
            console.error(error);
            Toastify({
                text: 'Failed to reorder products. Please try again.',
                duration: 3000,
                close: true,
                gravity: 'top',
                position: 'right',
                backgroundColor: 'red',
            }).showToast();
        }
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Products" />
            <div className={classes.headerContainer}>
                <div>
                    <h1 className={classes.title}>Manage Products</h1>
                    <p className={classes.description}>
                        This is where you will manage your product catalog and
                        inventory.
                    </p>
                </div>

                <div className={classes.toolbar}>
                    <Button
                        variant="outline"
                        onClick={() => expandAll(categories)}
                        className={classes.expand_icon}
                    >
                        Expand All
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => collapseAll()}
                        className={classes.collapse_icon}
                    >
                        Collapse All
                    </Button>
                </div>
            </div>
            <div className={classes.container}>
                {categories.map((category) => (
                    <ProductNode
                        key={category.id}
                        category={category}
                        onProductOrderChange={handleProductOrderChange}
                    />
                ))}
            </div>
        </DashboardLayout>
    );
}
