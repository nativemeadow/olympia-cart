import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CartItem, Cart } from '@/types/model-types';

type ShoppingCartStore = {
    items: Array<CartItem>;
    removeItem: (itemId: number) => void;
    clearCart: () => void;
    syncCart: (cart: Cart | null) => void;
    cartCount: () => number;
    cartId: () => number | null;
};

export const useShoppingCartStore = create(
    devtools<ShoppingCartStore>(
        (set, get) => ({
            items: [],
            removeItem: (itemId) =>
                set((state) => ({
                    items: state.items.filter(
                        (item) => item.item_id !== itemId,
                    ),
                })),
            clearCart: () => set({ items: [] }),
            syncCart: (cart) => {
                set({
                    items: cart?.items || [],
                });
            },
            cartCount: () => {
                return get().items.length;
            },
            cartId: () => {
                return get().items[0]?.cart_id || null;
            },
        }),
        { name: 'ShoppingCartStore' },
    ),
);
