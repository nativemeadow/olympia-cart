import DashboardLayout from '@/layouts/dashboard-layout';
import { Head, router } from '@inertiajs/react';
import { CategoryHierarchy } from '@/types';
import { useEffect, useState } from 'react';
import CategoryNode from './category-node';
import styles from './categories.module.css';
import {
    CategoryExpandedProvider,
    useCategoryExpanded,
} from '@/context/CategoryExpandedContext';
import { Button } from '@/components/ui/button';

type Props = {
    categories: CategoryHierarchy[];
};

function getAllCategoryIds(categories: CategoryHierarchy[]): number[] {
    let ids: number[] = [];
    for (const category of categories) {
        ids.push(category.id);
        if (category.children) {
            ids = ids.concat(getAllCategoryIds(category.children));
        }
    }
    return ids;
}

function CategoryActions({ categories }: Props) {
    const { expandAll, collapseAll } = useCategoryExpanded();
    const allIds = getAllCategoryIds(categories);

    return (
        <div className={styles.toolbar}>
            <Button onClick={() => expandAll(allIds)} variant="outline">
                Expand All
            </Button>
            <Button onClick={collapseAll} variant="outline">
                Collapse All
            </Button>
        </div>
    );
}

export default function Categories({ categories: initialCategories }: Props) {
    const [categoryTree, setCategoryTree] =
        useState<CategoryHierarchy[]>(initialCategories);
    const [draggedCategoryId, setDraggedCategoryId] = useState<number | null>(
        null,
    );

    useEffect(() => {
        setCategoryTree(initialCategories);
    }, [initialCategories]);

    const handleCategoryOrderChange = (
        parentId: number | null,
        reorderedCategories: CategoryHierarchy[],
    ) => {
        const category_order = reorderedCategories.map((cat, index) => ({
            child_id: cat.id,
            order: index,
        }));

        router.put(
            route('dashboard.categories.order'),
            { parent_id: parentId, categories: category_order },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Optionally refresh data or rely on Inertia's response
                },
            },
        );
    };

    const findAndReorder = (
        nodes: CategoryHierarchy[],
        draggedId: number,
        targetId: number,
    ): CategoryHierarchy[] => {
        let parentOfDragged: CategoryHierarchy[] | null = null;
        let parentOfTarget: CategoryHierarchy[] | null = null;

        // Recursive function to find the parent array
        const findParent = (
            currentNodes: CategoryHierarchy[],
            id: number,
        ): CategoryHierarchy[] | null => {
            if (currentNodes.some((node) => node.id === id)) {
                return currentNodes;
            }
            for (const node of currentNodes) {
                if (node.children) {
                    const found = findParent(node.children, id);
                    if (found) return found;
                }
            }
            return null;
        };

        parentOfDragged = findParent(nodes, draggedId);
        parentOfTarget = findParent(nodes, targetId);

        // Proceed only if they share the same parent
        if (parentOfDragged && parentOfDragged === parentOfTarget) {
            const reordered = [...parentOfDragged];
            const draggedIndex = reordered.findIndex((c) => c.id === draggedId);
            const targetIndex = reordered.findIndex((c) => c.id === targetId);

            if (draggedIndex !== -1 && targetIndex !== -1) {
                const [draggedItem] = reordered.splice(draggedIndex, 1);
                reordered.splice(targetIndex, 0, draggedItem);

                // Now we need to update the tree immutably
                const updateTree = (
                    currentNodes: CategoryHierarchy[],
                ): CategoryHierarchy[] => {
                    return currentNodes.map((node) => {
                        if (node.children === parentOfDragged) {
                            // This is the parent node whose children we reordered
                            return { ...node, children: reordered };
                        } else if (node.children) {
                            // Recurse to find the parent in deeper levels
                            return {
                                ...node,
                                children: updateTree(node.children),
                            };
                        }
                        return node;
                    });
                };

                // Special case for root nodes
                if (parentOfDragged === nodes) {
                    handleCategoryOrderChange(null, reordered);
                    return reordered;
                } else {
                    const newTree = updateTree(nodes);
                    const parentNode = findParentNode(newTree, draggedId);
                    if (parentNode) {
                        handleCategoryOrderChange(parentNode.id, reordered);
                    }
                    return newTree;
                }
            }
        }

        // If no reordering happened, return the original nodes
        return nodes;
    };

    // Helper to find the parent node object itself
    const findParentNode = (
        nodes: CategoryHierarchy[],
        childId: number,
    ): CategoryHierarchy | null => {
        for (const node of nodes) {
            if (node.children?.some((child) => child.id === childId)) {
                return node;
            }
            if (node.children) {
                const found = findParentNode(node.children, childId);
                if (found) return found;
            }
        }
        return null;
    };

    const handleDragStart = (categoryId: number) => {
        setDraggedCategoryId(categoryId);
    };

    const handleDrop = (targetCategoryId: number) => {
        if (
            draggedCategoryId === null ||
            draggedCategoryId === targetCategoryId
        ) {
            return;
        }

        setCategoryTree((currentTree) =>
            findAndReorder(currentTree, draggedCategoryId, targetCategoryId),
        );
        setDraggedCategoryId(null);
    };

    return (
        <DashboardLayout>
            <Head title="Categories" />
            <CategoryExpandedProvider>
                <div className={styles.headerContainer}>
                    <div>
                        <h1 className={styles.title}>Manage Categories</h1>
                        <p className={styles.description}>
                            This is where you will add, edit, and delete product
                            categories.
                        </p>
                    </div>
                    <CategoryActions categories={categoryTree} />
                </div>
                <div className={styles.container}>
                    {categoryTree.map((category) => (
                        <CategoryNode
                            key={category.id}
                            category={category}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                        />
                    ))}
                </div>
            </CategoryExpandedProvider>
        </DashboardLayout>
    );
}
