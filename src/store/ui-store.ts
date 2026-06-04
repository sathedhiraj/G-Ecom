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

interface NavigationEntry {
  page: PageRoute;
  productId?: string | null;
  orderId?: string | null;
}

interface UIState {
  currentPage: PageRoute;
  selectedProductId: string | null;
  selectedOrderId: string | null;
  productFilters: typeof defaultFilters;
  navigationHistory: NavigationEntry[];
  navigate: (page: PageRoute, params?: { productId?: string; orderId?: string }) => void;
  goBack: () => void;
  setProductFilters: (filters: Partial<UIState['productFilters']>) => void;
  resetProductFilters: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  currentPage: 'home',
  selectedProductId: null,
  selectedOrderId: null,
  productFilters: { ...defaultFilters },
  navigationHistory: [],

  navigate: (page: PageRoute, params?: { productId?: string; orderId?: string }) => {
    const state = get();
    // Push current page to history before navigating
    set({
      navigationHistory: [
        ...state.navigationHistory,
        {
          page: state.currentPage,
          productId: state.selectedProductId,
          orderId: state.selectedOrderId,
        },
      ],
      currentPage: page,
      selectedProductId: params?.productId ?? null,
      selectedOrderId: params?.orderId ?? null,
    });
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  goBack: () => {
    const state = get();
    const history = [...state.navigationHistory];
    const lastEntry = history.pop();
    if (lastEntry) {
      set({
        currentPage: lastEntry.page,
        selectedProductId: lastEntry.productId ?? null,
        selectedOrderId: lastEntry.orderId ?? null,
        navigationHistory: history,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // If no history, go to home
      set({
        currentPage: 'home',
        selectedProductId: null,
        selectedOrderId: null,
        navigationHistory: [],
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
