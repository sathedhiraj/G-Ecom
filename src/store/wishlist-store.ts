import { create } from 'zustand';
import { WishlistItem } from '@/types';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: (userId: string) => Promise<void>;
  addItem: (userId: string, productId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async (userId: string) => {
    try {
      set({ isLoading: true });
      const res = await fetch(`/api/wishlist?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const items: WishlistItem[] = data.items || [];
        set({ items, isLoading: false });
      } else {
        set({ items: [], isLoading: false });
      }
    } catch {
      set({ items: [], isLoading: false });
    }
  },

  addItem: async (userId: string, productId: string) => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId }),
      });

      if (res.ok) {
        const data = await res.json();
        const items: WishlistItem[] = data.items || [];
        set({ items, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  removeItem: async (itemId: string) => {
    try {
      const res = await fetch(`/api/wishlist/${itemId}`, {
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

  isInWishlist: (productId: string): boolean => {
    const { items } = get();
    return items.some((item) => item.productId === productId);
  },

  clearWishlist: () => {
    set({ items: [] });
  },
}));
