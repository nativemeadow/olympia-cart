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
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import classes from './products.module.css';

interface ProductNodeProps {
    category: CategoryHierarchy;
    openNodes: { [key: number]: boolean };
    toggleNode: (id: number) => void;
    onProductOrderChange: (categoryId: number, products: ProductType[]) => void;
}

const ProductNode: React.FC<ProductNodeProps> = ({
    category,
    openNodes,
    toggleNode,
    onProductOrderChange,
}) => {
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
            toggleNode(category.id);
        }
    };

    const handleSuccess = () => {
        router.visit(route('dashboard.products'), {
            only: ['categories'],
            preserveScroll: true,
        });
    };

    const handleDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        productId: number,
    ) => {
        setDraggedProductId(productId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (
        e: React.DragEvent<HTMLDivElement>,
        targetProductId: number,
    ) => {
        e.preventDefault();
        if (targetProductId !== dropTargetId) {
            setDropTargetId(targetProductId);
        }
    };

    const handleDragLeave = () => {
        setDropTargetId(null);
    };

    const handleDrop = (
        e: React.DragEvent<HTMLDivElement>,
        targetProductId: number,
    ) => {
        e.preventDefault();
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
        <div className={classes.node}>
            <div className={classes.node_header}>
                <div className={classes.node_icon_container}>
                    {isExpandable ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleToggle}
                            className={classes.action_icon}
                        >
                            {isOpen ? (
                                <ChevronDown className={classes.chevron_icon} />
                            ) : (
                                <ChevronRight
                                    className={classes.chevron_icon}
                                />
                            )}
                        </Button>
                    ) : (
                        <span /> // Empty span to maintain alignment
                    )}
                </div>
                <span className={classes.node_title}>{category.title}</span>
                <div className={classes.actions}>
                    <AddProductAction
                        onSuccess={handleSuccess}
                        categoryId={category.id}
                    />
                </div>
            </div>
            {isOpen && (
                <div className={classes.children_container}>
                    {/* Render Child Categories */}
                    {hasChildren &&
                        category.children?.map((child) => (
                            <ProductNode
                                key={child.id}
                                category={child}
                                openNodes={openNodes}
                                toggleNode={toggleNode}
                                onProductOrderChange={onProductOrderChange}
                            />
                        ))}

                    {/* Render Products */}
                    {hasProducts &&
                        products?.map((product: ProductType) => (
                            <div
                                key={`product-${product.id}`}
                                id={`product-${product.id}`}
                                className={`${classes.node} ${
                                    classes.product_node
                                } ${
                                    dropTargetId === product.id
                                        ? classes.drop_target
                                        : ''
                                }`}
                                draggable="true"
                                onDragStart={(e) =>
                                    handleDragStart(e, product.id)
                                }
                                onDragOver={(e) =>
                                    handleDragOver(e, product.id)
                                }
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, product.id)}
                            >
                                <div className={classes.node_header}>
                                    <div
                                        className={
                                            classes.drag_handle_icon_container
                                        }
                                    >
                                        <GripVertical
                                            className={classes.drag_handle_icon}
                                        />
                                    </div>
                                    <div
                                        className={classes.node_icon_container}
                                    >
                                        <Package
                                            className={classes.product_icon}
                                        />
                                    </div>
                                    <span className={classes.node_title}>
                                        {product.title}
                                    </span>
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
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default ProductNode;
