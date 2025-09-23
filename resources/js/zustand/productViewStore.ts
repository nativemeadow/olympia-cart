import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Product, Price } from '@/types/model-types';

interface ProductViewState {
    product: Product | null;

    selectedPrice: Price | null;
    selectedPriceIndex: number | undefined;
    setProduct: (product: Product | null) => void;
    setSelectedPrice: (index: number | null) => void;
    productQty: number;
    setProductQty: (qty: number) => void;
}

export const useProductViewStore = create(
    devtools<ProductViewState>((set) => ({
        product: null,
        selectedPrice: null,
        selectedPriceIndex: undefined,
        productQty: 1,

        setProduct: (product: Product | null) => set({ product }),
        setSelectedPrice: (index: number | null) => {
            set((state) => {
                if (index === null) {
                    return { selectedPriceIndex: undefined, selectedPrice: null };
                }
                return {
                    selectedPriceIndex: index,
                    selectedPrice:
                        state.product && Array.isArray(state.product.prices) && state.product.prices[index] ? state.product.prices[index] : null,
                };
            });
        },
        setProductQty: (qty: number) => set({ productQty: qty }),
    })),
);
