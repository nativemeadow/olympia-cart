import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { CategoryHierarchy } from '@/types';
import { useProductsAdminStore } from './product-admin-store';

type ProductTreeState = {
    openNodes: { [key: number]: boolean };
    activeCategoryId: number | null;
    setOpenNodes: (openNodes: { [key: number]: boolean }) => void;
    toggleNode: (category: CategoryHierarchy) => void;
    expandAll: (categories: CategoryHierarchy[]) => void;
    collapseAll: () => void;
    setActiveCategoryId: (id: number | null) => void;
};

export const useProductTreeStore = create<ProductTreeState>()(
    devtools(
        persist(
            (set, get) => ({
                openNodes: {},
                activeCategoryId: null,
                setOpenNodes: (openNodes) => set({ openNodes }),
                toggleNode: (category) => {
                    const { openNodes } = get();
                    const { addCategory, removeCategory } =
                        useProductsAdminStore.getState();
                    const categoryId = category.id;
                    const isOpen = !!openNodes[categoryId];

                    if (isOpen) {
                        removeCategory(categoryId);
                    } else {
                        addCategory(category);
                    }

                    set({
                        openNodes: {
                            ...openNodes,
                            [categoryId]: !isOpen,
                        },
                    });
                },
                expandAll: (categories) => {
                    const allIds: { [key: number]: boolean } = {};
                    const { setCategories } = useProductsAdminStore.getState();
                    setCategories(categories);
                    const traverse = (nodes: CategoryHierarchy[]) => {
                        nodes.forEach((node) => {
                            if (
                                node.children?.length ||
                                node.products?.length
                            ) {
                                allIds[node.id] = true;
                            }
                            if (node.children) {
                                traverse(node.children);
                            }
                        });
                    };
                    traverse(categories);
                    set({ openNodes: allIds });
                },
                collapseAll: () => {
                    const { removeAllCategories } =
                        useProductsAdminStore.getState();
                    removeAllCategories();
                    set({ openNodes: {} });
                },
                setActiveCategoryId: (id) => set({ activeCategoryId: id }),
            }),
            {
                name: 'product-tree-storage', // name of the item in the storage (must be unique)
                storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
            },
        ),
    ),
);
