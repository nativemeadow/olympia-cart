import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CategoryHierarchy } from '@/types';
import { Category } from '@/types/model-types';
import {
    useCategoryExpanded,
    CategoryExpandedProvider,
} from '@/context/CategoryExpandedContext';
import { ChevronDown, ChevronRight } from 'lucide-react';
import classes from './category-selection-modal.module.css';

interface CategoryNodeProps {
    category: CategoryHierarchy;
    selectedCategories: Set<number>;
    onCategoryToggle: (categoryId: number) => void;
}

const getAllCategoryIds = (categories: CategoryHierarchy[]): number[] => {
    return categories.flatMap((category) => [
        category.id,
        ...(category.children ? getAllCategoryIds(category.children) : []),
    ]);
};

const CategoryNodeWithCheckbox: React.FC<CategoryNodeProps> = ({
    category,
    selectedCategories,
    onCategoryToggle,
}) => {
    const isSelected = selectedCategories.has(category.id);
    const { expanded, toggle } = useCategoryExpanded();
    const isOpen = expanded.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const isExpandable = hasChildren;

    const handleToggle = () => {
        if (isExpandable) {
            toggle(category.id);
        }
    };

    return (
        <div className={classes.category_node_container}>
            <div className={classes.category_node_item}>
                <Checkbox
                    id={`category-${category.id}`}
                    checked={isSelected}
                    onCheckedChange={() => onCategoryToggle(category.id)}
                />
                <label
                    htmlFor={`category-${category.id}`}
                    className="ml-2 text-sm leading-none font-medium"
                >
                    {isExpandable ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleToggle}
                            className={classes.toggle_button}
                        >
                            {isOpen ? (
                                <ChevronDown className={classes.chevron_icon} />
                            ) : (
                                <ChevronRight
                                    className={classes.chevron_icon}
                                />
                            )}
                        </Button>
                    ) : null}
                    <span className={classes.node_title}>{category.title}</span>
                </label>
            </div>
            {isOpen && hasChildren && category.children && (
                <div key={category.id} className={classes.node_children}>
                    {category.children.map((child) => (
                        <CategoryNodeWithCheckbox
                            category={child}
                            selectedCategories={selectedCategories}
                            onCategoryToggle={onCategoryToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

interface CategorySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    allCategories: CategoryHierarchy[];
    selectedCategories: Category[];
    onSave: (selectedCategories: Category[]) => void;
}

const CategorySelectionModalContent: React.FC<
    Omit<CategorySelectionModalProps, 'isOpen' | 'onClose'> & {
        onClose: () => void;
    }
> = ({ allCategories, selectedCategories, onSave, onClose }) => {
    const [currentSelectedIds, setCurrentSelectedIds] = useState<Set<number>>(
        new Set(),
    );
    const { expandAll, collapseAll } = useCategoryExpanded();

    console.log('all Categories in Modal:', allCategories);
    console.log('Selected Categories in Modal:', selectedCategories);

    useEffect(() => {
        setCurrentSelectedIds(new Set(selectedCategories.map((c) => c.id)));
    }, [selectedCategories]);

    const handleCategoryToggle = (categoryId: number) => {
        setCurrentSelectedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const handleSave = () => {
        const flatCategories = (
            categories: CategoryHierarchy[],
        ): CategoryHierarchy[] => {
            return categories.flatMap((c) => [
                c,
                ...flatCategories(c.children || []),
            ]);
        };

        const allFlat = flatCategories(allCategories);
        const selected = allFlat.filter((c) => currentSelectedIds.has(c.id));
        onSave(selected);
        onClose();
    };

    const handleExpandAll = () => {
        const allIds = getAllCategoryIds(allCategories);
        expandAll(allIds);
    };

    return (
        <>
            <DialogHeader>
                <div className="mt-4 flex items-center justify-between">
                    <DialogTitle>Select Categories</DialogTitle>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleExpandAll}
                        >
                            Expand All
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={collapseAll}
                        >
                            Collapse All
                        </Button>
                    </div>
                </div>
            </DialogHeader>
            <div className={classes.scrollable_content}>
                {allCategories.map((category) => (
                    <CategoryNodeWithCheckbox
                        key={category.id}
                        category={category}
                        selectedCategories={currentSelectedIds}
                        onCategoryToggle={handleCategoryToggle}
                    />
                ))}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
        </>
    );
};

const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
    isOpen,
    onClose,
    ...props
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`sm:max-w-150 ${classes.modal_content}`}>
                <CategoryExpandedProvider>
                    <CategorySelectionModalContent
                        {...props}
                        onClose={onClose}
                    />
                </CategoryExpandedProvider>
            </DialogContent>
        </Dialog>
    );
};

export default CategorySelectionModal;
