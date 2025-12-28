import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ProductType, PriceVariantType } from '@/types';

interface ProductViewState {
    product: ProductType | null;
    categorySlug?: string;
    productImage: string | null;
    hasOnePrice: boolean;
    hasMultipleImages: boolean;

    selectedPrice: PriceVariantType | null;
    selectedPriceIndex: number | undefined;
    setProduct: (
        categorySlug: string | null,
        product: ProductType | null,
    ) => void;
    // setProduct: (product: Product | null) => void;
    setSelectedPrice: (index: number | null) => void;
    productQty: number;
    setProductQty: (qty: number) => void;
}

export const useProductViewStore = create(
    devtools<ProductViewState>((set) => ({
        product: null,
        categorySlug: undefined,
        productImage: null,
        hasMultipleImages: false,
        hasOnePrice: false,
        selectedPrice: null,
        selectedPriceIndex: undefined,
        productQty: 1,

        setProduct: (
            categorySlug: string | null,
            product: ProductType | null,
        ) => {
            const hasOnePrice = product?.prices?.length === 1;
            const selectedPrice = hasOnePrice ? product!.prices![0] : null;
            const selectedPriceIndex = hasOnePrice ? 0 : undefined;
            const productImage = product?.image || null;

            product?.prices?.forEach((price) => {
                if (price.image && price.image !== product?.image) {
                    set({ hasMultipleImages: true });
                }
            });

            set({
                product,
                selectedPrice,
                selectedPriceIndex,
                productQty: 1,
                productImage,
            });
        },
        setSelectedPrice: (index: number | null) => {
            set((state) => {
                if (index === null) {
                    return {
                        selectedPriceIndex: undefined,
                        selectedPrice: null,
                    };
                }
                if (
                    state.product &&
                    Array.isArray(state.product.prices) &&
                    state.product.prices[index]
                ) {
                    const priceImage = state.product.prices[index].image;
                    state.productImage =
                        (typeof priceImage === 'string' ? priceImage : null) ||
                        state.product.image ||
                        null;
                }
                return {
                    selectedPriceIndex: index,
                    selectedPrice:
                        state.product &&
                        Array.isArray(state.product.prices) &&
                        state.product.prices[index]
                            ? state.product.prices[index]
                            : null,
                };
            });
        },
        setProductQty: (qty: number) => set({ productQty: qty }),
    })),
);
