import { create } from 'zustand';
import { CartItemType } from '@/types';

interface CartState {
  items: CartItemType[];
  isLoading: boolean;
  fetchCart: (userId: string) => Promise<void>;
  addItem: (userId: string, productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number, userId?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async (userId: string) => {
    try {
      set({ isLoading: true });
      const res = await fetch(`/api/cart?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        // API returns { cart: { items: [...] } }
        const items: CartItemType[] = data.cart?.items || [];
        set({ items, isLoading: false });
      } else {
        set({ items: [], isLoading: false });
      }
    } catch {
      set({ items: [], isLoading: false });
    }
  },

  addItem: async (userId: string, productId: string, quantity: number = 1) => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity }),
      });

      if (res.ok) {
        const data = await res.json();
        // API returns { cart: { items: [...] } }
        const items: CartItemType[] = data.cart?.items || [];
        set({ items, isLoading: false });
      } else {
        // Re-fetch cart on error to ensure consistency
        await get().fetchCart(userId);
      }
    } catch {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId: string, quantity: number, userId?: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (res.ok) {
        // PUT returns { cartItem: updatedItem } — single item, not full cart
        // Update the item in-place in the store
        const data = await res.json();
        const updatedItem = data.cartItem;
        if (updatedItem) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === itemId ? { ...item, quantity: updatedItem.quantity } : item
            ),
          }));
        } else if (userId) {
          // Fallback: re-fetch entire cart
          await get().fetchCart(userId);
        }
      }
    } catch {
      // Keep existing items on error
    }
  },

  removeItem: async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      }
    } catch {
      // Keep existing items on error
    }
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  },
}));
