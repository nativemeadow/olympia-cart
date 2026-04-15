import React, { useEffect, useState } from 'react';
import { CategoryHierarchy } from '@/types';
import { Product as ProductType } from '@/types/model-types';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Package, GripVertical } from 'lucide-react';
import {
    AddProductAction,
    EditProductAction,
    DeleteProductAction,
} from './product-actions';
import { router, usePage } from '@inertiajs/react';
import { useProductTreeStore } from '@/zustand/product-tree-store';
import { useProductsAdminStore } from '@/zustand/product-admin-store';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import classes from './products.module.css';

interface ProductNodeProps {
    category: CategoryHierarchy;
    onProductOrderChange: (categoryId: number, products: ProductType[]) => void;
}

const ProductNode: React.FC<ProductNodeProps> = ({
    category,
    onProductOrderChange,
}) => {
    const { openNodes, toggleNode, setActiveCategoryId } =
        useProductTreeStore();
    const { setCurrentProduct } = useProductsAdminStore();
    const { props } = usePage();
    const isOpen = openNodes[category.id] || false;
    const hasChildren = category.children && category.children.length > 0;
    const hasProducts = category.products && category.products.length > 0;
    const isExpandable = hasChildren || hasProducts;
    const [products, setProducts] = useState<ProductType[]>(
        category.products || [],
    );
    const [draggedProductId, setDraggedProductId] = useState<number | null>(
        null,
    );
    const [dropTargetId, setDropTargetId] = useState<number | null>(null);

    useEffect(() => {
        setProducts(category.products || []);
    }, [category.products]);

    useEffect(() => {
        const flash = props.flash as { success?: string };
        if (flash && flash.success) {
            Toastify({
                text: flash.success,
                duration: 3000,
                close: true,
                gravity: 'top',
                position: 'right',
                backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)',
            }).showToast();
        }
    }, [props.flash]);

    const handleToggle = () => {
        if (isExpandable) {
            toggleNode(category);
        }
    };

    const handleSuccess = (categoryId: number) => {
        // Set the active category ID in the store
        setActiveCategoryId(categoryId);
        // Reload the page data
        router.visit(route('dashboard.products'), {
            only: ['categories'],
            preserveState: true,
            preserveScroll: false, // Allow scrolling to the element
            onSuccess: () => {
                const element = document.getElementById(
                    `category-${categoryId}`,
                );
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }
            },
        });
    };

    const handleDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        productId: number,
    ) => {
        setDraggedProductId(productId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', `${category.id}:${productId}`);
    };

    const handleDragOver = (
        e: React.DragEvent<HTMLDivElement>,
        targetProductId: number,
    ) => {
        e.preventDefault();
        const draggedData = e.dataTransfer.getData('text/plain');
        if (!draggedData) return;

        const [sourceCategoryId] = draggedData.split(':');
        if (Number(sourceCategoryId) !== category.id) {
            e.dataTransfer.dropEffect = 'none';
            setDropTargetId(null);
            return;
        }

        e.dataTransfer.dropEffect = 'move';
        if (targetProductId !== dropTargetId) {
            setDropTargetId(targetProductId);
        }
    };

    const handleDragLeave = () => {
        setDropTargetId(null);
    };

    const handleDragEnd = () => {
        setDraggedProductId(null);
        setDropTargetId(null);
    };

    const handleDrop = (
        e: React.DragEvent<HTMLDivElement>,
        targetProductId: number,
    ) => {
        e.preventDefault();
        const draggedData = e.dataTransfer.getData('text/plain');
        if (!draggedData) return;
        const [sourceCategoryId] = draggedData.split(':');
        if (Number(sourceCategoryId) !== category.id) {
            return;
        }
        if (draggedProductId === null || draggedProductId === targetProductId) {
            return;
        }

        const newProducts = [...products];
        const draggedIndex = newProducts.findIndex(
            (p) => p.id === draggedProductId,
        );
        const targetIndex = newProducts.findIndex(
            (p) => p.id === targetProductId,
        );

        if (draggedIndex === -1 || targetIndex === -1) return;

        const [draggedItem] = newProducts.splice(draggedIndex, 1);
        newProducts.splice(targetIndex, 0, draggedItem);

        setProducts(newProducts);
        onProductOrderChange(category.id, newProducts);
        setDraggedProductId(null);
        setDropTargetId(null);
    };

    return (
        <div
            key={category.id}
            id={`category-${category.id}`}
            className={classes.node}
        >
            <div className={classes.node_header}>
                {isExpandable ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggle();
                        }}
                        className={classes.toggle_button}
                    >
                        {isOpen ? (
                            <ChevronDown className={classes.chevron_icon} />
                        ) : (
                            <ChevronRight className={classes.chevron_icon} />
                        )}
                    </Button>
                ) : (
                    <div className={classes.toggle_button_placeholder} />
                )}
                <div className={classes.node_title}>
                    <span className={classes.category_title}>
                        {category.title}
                    </span>
                </div>
                <div className={classes.actions}>
                    <AddProductAction
                        categoryId={category.id}
                        onSuccess={handleSuccess}
                    />
                </div>
            </div>
            {isOpen && (
                <div className={classes.children_container}>
                    {hasProducts &&
                        products.map((product) => (
                            <div
                                key={product.id}
                                className={`${classes.product_item} ${
                                    dropTargetId === product.id
                                        ? classes.drop_target
                                        : ''
                                }`}
                                draggable
                                onDragStart={(e) =>
                                    handleDragStart(e, product.id)
                                }
                                onDragOver={(e) =>
                                    handleDragOver(e, product.id)
                                }
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, product.id)}
                                onDragEnd={handleDragEnd}
                            >
                                <div
                                    className={
                                        classes.drag_handle_icon_container
                                    }
                                >
                                    <GripVertical
                                        className={classes.drag_handle_icon}
                                    />
                                </div>
                                <Package className={classes.product_icon} />
                                <div className={classes.node_title}>
                                    <span>{product.title}</span>
                                </div>
                                <div className={classes.actions}>
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
                    {hasChildren &&
                        category.children &&
                        category.children.map((child) => (
                            <ProductNode
                                key={child.id}
                                category={child}
                                onProductOrderChange={onProductOrderChange}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};

export default ProductNode;
