import React, { useState } from 'react';
import { CategoryHierarchy } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
    AddCategoryAction,
    DeleteCategoryAction,
    EditCategoryAction,
} from './category-actions';
import { router } from '@inertiajs/react';
import styles from './categories.module.css';

interface CategoryNodeProps {
    category: CategoryHierarchy;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({ category }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isNode = category.children && category.children.length > 0;

    const handleToggle = () => {
        if (isNode) {
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
                {isNode ? (
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
                    // This is a leaf, add some padding to align it with nodes
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
            {isNode && isOpen && (
                <div className={styles.children_container}>
                    {category.children?.map((child) => (
                        <CategoryNode key={child.id} category={child} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryNode;
