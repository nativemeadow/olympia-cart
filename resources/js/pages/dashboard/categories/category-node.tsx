import React, { useState } from 'react';
import { CategoryHierarchy } from '@/types';
import { Product as ProductType } from '@/types/model-types';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import {
    AddCategoryAction,
    DeleteCategoryAction,
    EditCategoryAction,
} from './category-actions';
import {
    EditProductAction,
    DeleteProductAction,
} from '../products/product-actions';
import { router } from '@inertiajs/react';
import styles from './categories.module.css';

interface CategoryNodeProps {
    category: CategoryHierarchy;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({ category }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = category.children && category.children.length > 0;
    const hasProducts = category.products && category.products.length > 0;
    const isExpandable = hasChildren || hasProducts;

    const handleToggle = () => {
        if (isExpandable) {
            setIsOpen(!isOpen);
        }
    };

    const handleSuccess = () => {
        router.visit(route('dashboard.categories.index'), {
            only: ['categories'],
            preserveScroll: true,
        });
    };

    return (
        <div className={styles.node}>
            <div className={styles.node_header}>
                {isExpandable ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggle}
                        className={styles.toggle_button}
                    >
                        {isOpen ? (
                            <ChevronDown className={styles.chevron_icon} />
                        ) : (
                            <ChevronRight className={styles.chevron_icon} />
                        )}
                    </Button>
                ) : (
                    <div className={styles.toggle_placeholder}></div>
                )}
                <span className={styles.node_title}>{category.title}</span>
                <div className={styles.actions}>
                    <AddCategoryAction
                        category={category}
                        onSuccess={handleSuccess}
                    />
                    <EditCategoryAction
                        category={category}
                        onSuccess={handleSuccess}
                    />
                    <DeleteCategoryAction
                        category={category}
                        onSuccess={handleSuccess}
                    />
                </div>
            </div>
            {isOpen && (
                <div className={styles.children_container}>
                    {hasChildren &&
                        category.children?.map((child) => (
                            <CategoryNode key={child.id} category={child} />
                        ))}
                    {hasProducts &&
                        category.products?.map((product: ProductType) => (
                            <div
                                key={`product-${product.id}`}
                                className={`${styles.node} ${styles.product_node}`}
                            >
                                <div className={styles.node_header}>
                                    <div className={styles.toggle_placeholder}>
                                        <Package
                                            className={styles.product_icon}
                                        />
                                    </div>
                                    <span className={styles.node_title}>
                                        {product.title}
                                    </span>
                                    <div className={styles.actions}>
                                        <EditProductAction
                                            product={product}
                                            onSuccess={handleSuccess}
                                        />
                                        <DeleteProductAction
                                            product={product}
                                            onSuccess={handleSuccess}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default CategoryNode;
