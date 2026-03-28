import React, { useState } from 'react';
import { CategoryHierarchy } from '@/types';
import { Product as ProductType } from '@/types/model-types';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Package, GripVertical } from 'lucide-react';
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
import { useCategoryExpanded } from '@/context/CategoryExpandedContext';

interface CategoryNodeProps {
    category: CategoryHierarchy;
    onDragStart: (categoryId: number) => void;
    onDrop: (categoryId: number) => void;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
    category,
    onDragStart,
    onDrop,
}) => {
    const { expanded, toggle } = useCategoryExpanded();
    const isOpen = expanded.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const hasProducts = category.products && category.products.length > 0;
    const isExpandable = hasChildren || hasProducts;
    const [isDragOver, setIsDragOver] = useState(false);

    const handleToggle = () => {
        if (isExpandable) {
            toggle(category.id);
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(category.id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        onDrop(category.id);
        setIsDragOver(false);
    };

    const handleSuccess = () => {
        router.visit(route('dashboard.categories.index'), {
            only: ['categories'],
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <div className={styles.node}>
            <div
                id={`category-${category.id}`}
                className={`${styles.node_header} ${isDragOver ? styles.drag_over : ''}`}
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className={styles.drag_handle_icon_container}>
                    <GripVertical className={styles.drag_handle_icon} />
                </div>
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
                <div className={styles.node_children}>
                    {hasChildren &&
                        category.children?.map((child) => (
                            <CategoryNode
                                key={child.id}
                                category={child}
                                onDragStart={onDragStart}
                                onDrop={onDrop}
                            />
                        ))}
                    {hasProducts &&
                        category.products?.map((product: ProductType) => (
                            <div
                                key={`product-${product.id}`}
                                className={styles.product_node}
                            >
                                <Package className={styles.product_node_icon} />
                                <span className={styles.product_node_title}>
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
                        ))}
                </div>
            )}
        </div>
    );
};

export default CategoryNode;
