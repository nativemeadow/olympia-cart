import React, { useState } from 'react';
import { CategoryHierarchy, ProductType as Product } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import styles from './products.module.css';

interface ProductNodeProps {
    category: CategoryHierarchy;
}

const ProductNode: React.FC<ProductNodeProps> = ({ category }) => {
    const [isOpen, setIsOpen] = useState(true); // Default to open
    const hasChildren = category.children && category.children.length > 0;
    const hasProducts = category.products && category.products.length > 0;

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={styles.node}>
            <div className={styles.node_header}>
                {hasChildren || hasProducts ? (
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
                    <div className={styles.toggle_button_placeholder}></div> // Placeholder for alignment
                )}
                <span className={styles.category_title}>{category.title}</span>
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
                        category.products?.map((product: Product) => (
                            <div
                                key={product.id}
                                className={styles.product_item}
                            >
                                <Package className={styles.product_icon} />
                                <span>{product.title}</span>
                                {/* Add Edit/Delete buttons for products here */}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default ProductNode;
