import DashboardLayout from '@/layouts/dashboard-layout';
import { Head, router } from '@inertiajs/react';
import { CategoryHierarchy } from '@/types';
import { Product as ProductType } from '@/types/model-types';
import ProductNode from './product-node';
import classes from './products.module.css';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

type CategoriesIndexProps = {
    categories: CategoryHierarchy[];
};

export default function Products({ categories }: CategoriesIndexProps) {
    const [openNodes, setOpenNodes] = useState<{ [key: number]: boolean }>({});

    // Default all nodes to open on initial render
    useEffect(() => {
        const allIds: { [key: number]: boolean } = {};
        const traverse = (nodes: CategoryHierarchy[]) => {
            nodes.forEach((node) => {
                if (node.children?.length || node.products?.length) {
                    allIds[node.id] = true;
                }
                if (node.children) {
                    traverse(node.children);
                }
            });
        };
        traverse(categories);
        setOpenNodes(allIds);
    }, [categories]);

    const toggleNode = (id: number) => {
        setOpenNodes((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const collapseAll = () => {
        setOpenNodes({});
    };

    const expandAll = () => {
        const allIds: { [key: number]: boolean } = {};
        const traverse = (nodes: CategoryHierarchy[]) => {
            nodes.forEach((node) => {
                if (node.children?.length || node.products?.length) {
                    allIds[node.id] = true;
                }
                if (node.children) {
                    traverse(node.children);
                }
            });
        };
        traverse(categories);
        setOpenNodes(allIds);
    };

    const handleProductOrderChange = (
        categoryId: number,
        products: ProductType[],
    ) => {
        const product_order = products.map((product, index) => ({
            product_id: product.id,
            product_order: index,
        }));

        router.put(
            route('dashboard.products.order'),
            { category_id: categoryId, products: product_order },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <DashboardLayout>
            <Head title="Products" />
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">
                    Manage Products
                </h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={expandAll}
                        className={classes.expand_icon}
                    >
                        Expand All
                    </Button>
                    <Button
                        variant="outline"
                        onClick={collapseAll}
                        className={classes.collapse_icon}
                    >
                        Collapse All
                    </Button>
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                This is where you will manage your product catalog and
                inventory.
            </p>
            <div className={classes.container}>
                {categories.map((category) => (
                    <ProductNode
                        key={category.id}
                        category={category}
                        openNodes={openNodes}
                        toggleNode={toggleNode}
                        onProductOrderChange={handleProductOrderChange}
                    />
                ))}
            </div>
        </DashboardLayout>
    );
}
