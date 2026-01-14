import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Cart } from '@/types/model-types';

type ShoppingCartStore = {
    cart: Cart | null;
    removeItem: (itemId: number) => void;
    clearCart: () => void;
    syncCart: (cart: Cart | null) => void;
    cartCount: () => number;
    cartTotal: () => number;
    cartId: () => number | null;
    getItems: () => Cart['items'] | [] | null;
};

export const useShoppingCartStore = create(
    devtools<ShoppingCartStore>(
        (set, get) => ({
            cart: null,
            removeItem: (itemId) =>
                set((state) => {
                    if (!state.cart) return {};
                    const updatedItems = state.cart.items?.filter(
                        (item) => item.id !== itemId,
                    );
                    return {
                        cart: { ...state.cart, items: updatedItems },
                    };
                }),
            clearCart: () =>
                set((state) => {
                    if (!state.cart) return { cart: null };
                    return { cart: { ...state.cart, items: [] } };
                }),
            syncCart: (cart) => {
                set({ cart });
            },
            cartCount: () => {
                return get().cart?.items?.length || 0;
            },
            cartTotal: () => {
                const total =
                    get().cart?.items?.reduce(
                        (total, item) =>
                            total + Number(item.price / 100) * item.quantity,
                        0,
                    ) || 0;
                return parseFloat(total.toFixed(2));
            },
            cartId: () => {
                return get().cart?.id || null;
            },
            getItems: () => {
                return get().cart?.items || [];
            },
        }),
        { name: 'ShoppingCartStore' },
    ),
);
