import { create } from 'zustand';
import { CartItemType } from '@/types';

interface CartState {
  items: CartItemType[];
  isLoading: boolean;
  fetchCart: (userId: string) => Promise<void>;
  addItem: (userId: string, productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
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
        const items: CartItemType[] = data.items || [];
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
        const items: CartItemType[] = data.items || [];
        set({ items, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (res.ok) {
        const data = await res.json();
        const items: CartItemType[] = data.items || [];
        set({ items });
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
