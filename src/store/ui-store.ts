import { create } from 'zustand';
import { PageRoute } from '@/types';

const defaultFilters = {
  search: '',
  category: '',
  brand: '',
  minPrice: null as number | null,
  maxPrice: null as number | null,
  rating: null as number | null,
  sort: 'featured',
};

interface UIState {
  currentPage: PageRoute;
  selectedProductId: string | null;
  selectedOrderId: string | null;
  productFilters: typeof defaultFilters;
  navigate: (page: PageRoute, params?: { productId?: string; orderId?: string }) => void;
  setProductFilters: (filters: Partial<UIState['productFilters']>) => void;
  resetProductFilters: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentPage: 'home',
  selectedProductId: null,
  selectedOrderId: null,
  productFilters: { ...defaultFilters },

  navigate: (page: PageRoute, params?: { productId?: string; orderId?: string }) => {
    set({
      currentPage: page,
      selectedProductId: params?.productId ?? null,
      selectedOrderId: params?.orderId ?? null,
    });
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setProductFilters: (filters: Partial<UIState['productFilters']>) => {
    set((state) => ({
      productFilters: { ...state.productFilters, ...filters },
    }));
  },

  resetProductFilters: () => {
    set({ productFilters: { ...defaultFilters } });
  },
}));
