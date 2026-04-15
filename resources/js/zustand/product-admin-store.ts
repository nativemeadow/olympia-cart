import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { CategoryHierarchy } from '@/types';
import { Product } from '@/types/model-types';

export type CurrentProduct = {
    status: 'created' | 'updated' | 'deleted' | null;
    product: Product | null;
    categoryId: number | null;
};

type ProductAdminState = {
    categories: CategoryHierarchy[];
    setCategories: (categories: CategoryHierarchy[]) => void;
    addCategory: (category: CategoryHierarchy) => void; // Add this
    removeCategory: (categoryId: number) => void; // Add this
    removeAllCategories: () => void; // Add this
    updateProductInCategory: (updatedProduct: Product) => void;
    updateProductOrder: (categoryId: number, products: Product[]) => void;
    updateProduct: (updatedProduct: Product) => void;
    addProduct: (newProduct: Product, categoryId: number) => void;
    deleteProduct: (productId: number, categoryId: number) => void;
    currentProduct: CurrentProduct | null;
    setCurrentProduct: (currentProduct: CurrentProduct | null) => void;
};

export const useProductsAdminStore = create<ProductAdminState>()(
    devtools(
        persist(
            (set, get) => ({
                categories: [],
                setCategories: (categories) => set({ categories }),
                currentProduct: null,
                addCategory: (newCategory) =>
                    set((state) => {
                        // Avoid adding duplicates
                        if (
                            state.categories.some(
                                (c) => c.id === newCategory.id,
                            )
                        ) {
                            return state;
                        }
                        return {
                            categories: [...state.categories, newCategory],
                        };
                    }),
                removeCategory: (categoryId) =>
                    set((state) => ({
                        categories: state.categories.filter(
                            (c) => c.id !== categoryId,
                        ),
                    })),

                removeAllCategories: () => set({ categories: [] }),

                setCurrentProduct: (currentProduct) => set({ currentProduct }),
                updateProductInCategory: (updatedProduct) => {
                    const { categories } = get();
                    const updatedCategories = categories.map((category) => {
                        if (category.products) {
                            const updatedProducts = category.products.map(
                                (product) =>
                                    product.id === updatedProduct.id
                                        ? updatedProduct
                                        : product,
                            );
                            return { ...category, products: updatedProducts };
                        }
                        return category;
                    });
                    set({ categories: updatedCategories });
                },
                updateProductOrder: (categoryId, products) => {
                    const { categories } = get();
                    const updatedCategories = categories.map((category) => {
                        if (category.id === categoryId) {
                            return { ...category, products };
                        }
                        return category;
                    });
                    set({ categories: updatedCategories });
                },
                updateProduct: (updatedProduct) => {
                    const { categories } = get();
                    const updatedCategories = categories.map((category) => {
                        if (category.products) {
                            const updatedProducts = category.products.map(
                                (product) => {
                                    if (product.id === updatedProduct.id) {
                                        set({
                                            currentProduct: {
                                                status: 'updated',
                                                product: updatedProduct,
                                                categoryId: category.id,
                                            },
                                        });
                                        return updatedProduct;
                                    }
                                    return product;
                                },
                            );
                            return { ...category, products: updatedProducts };
                        }
                        return category;
                    });
                    set({ categories: updatedCategories });
                },
                addProduct: (newProduct, categoryId) => {
                    const { categories } = get();
                    const updatedCategories = categories.map((category) => {
                        if (category.id === categoryId) {
                            const updatedProducts = category.products
                                ? [...category.products, newProduct]
                                : [newProduct];
                            set({
                                currentProduct: {
                                    status: 'created',
                                    product: newProduct,
                                    categoryId,
                                },
                            });
                            return { ...category, products: updatedProducts };
                        }
                        return category;
                    });
                    set({ categories: updatedCategories });
                },
                deleteProduct: (productId, categoryId) => {
                    const { categories } = get();
                    const updatedCategories = categories.map((category) => {
                        if (category.id === categoryId && category.products) {
                            const updatedProducts = category.products.filter(
                                (product) => product.id !== productId,
                            );
                            set({
                                currentProduct: {
                                    status: 'deleted',
                                    product: null,
                                    categoryId,
                                },
                            });
                            return { ...category, products: updatedProducts };
                        }
                        return category;
                    });
                    set({ categories: updatedCategories });
                },
            }),
            {
                name: 'products-admin-storage',
                storage: createJSONStorage(() => sessionStorage),
            },
        ),
    ),
);
