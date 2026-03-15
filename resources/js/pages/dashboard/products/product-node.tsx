import React, { useState, useEffect } from 'react';
import { CategoryHierarchy } from '@/types';
import { Product as ProductType } from '@/types/model-types';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import {
    AddProductAction,
    EditProductAction,
    DeleteProductAction,
} from './product-actions';
import { router, usePage } from '@inertiajs/react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import styles from './products.module.css';
import classes from './products.module.css';

interface ProductNodeProps {
    category: CategoryHierarchy;
}

const ProductNode: React.FC<ProductNodeProps> = ({ category }) => {
    const [isOpen, setIsOpen] = useState(true); // Default to open
    const { props } = usePage();
    const hasChildren = category.children && category.children.length > 0;
    const hasProducts = category.products && category.products.length > 0;
    const isExpandable = hasChildren || hasProducts;

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
        if (isExpandable) setIsOpen(!isOpen);
    };

    const handleSuccess = () => {
        router.visit(route('dashboard.products'), {
            only: ['categories'],
            preserveScroll: true,
        });
    };

    return (
        <div className={styles.node}>
            <div className={styles.node_header}>
                <div className={styles.node_icon_container}>
                    {isExpandable ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleToggle}
                            className={classes.action_icon}
                        >
                            {isOpen ? (
                                <ChevronDown className={styles.chevron_icon} />
                            ) : (
                                <ChevronRight className={styles.chevron_icon} />
                            )}
                        </Button>
                    ) : (
                        <span /> // Empty span to maintain alignment
                    )}
                </div>
                <span className={styles.node_title}>{category.title}</span>
                <div className={styles.actions}>
                    <AddProductAction
                        onSuccess={handleSuccess}
                        categoryId={category.id}
                    />
                </div>
            </div>
            {isOpen && (
                <div className={styles.children_container}>
                    {/* Render Child Categories */}
                    {hasChildren &&
                        category.children?.map((child) => (
                            <ProductNode key={child.id} category={child} />
                        ))}

                    {/* Render Products */}
                    {hasProducts &&
                        category.products?.map((product: ProductType) => (
                            <div
                                key={`product-${product.id}`}
                                className={`${styles.node} ${styles.product_node}`}
                            >
                                <div className={styles.node_header}>
                                    <div className={styles.node_icon_container}>
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

export default ProductNode;
