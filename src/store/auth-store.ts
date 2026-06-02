import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: (userId?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isLoggedIn: false,

  login: async (email: string, password: string): Promise<boolean> => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        set({ isLoading: false });
        return false;
      }

      const data = await res.json();
      const user: User = data.user;

      localStorage.setItem('userId', user.id);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoggedIn: true, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  register: async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        set({ isLoading: false });
        return false;
      }

      const data = await res.json();
      const user: User = data.user;

      localStorage.setItem('userId', user.id);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoggedIn: true, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    set({ user: null, isLoggedIn: false, isLoading: false });
  },

  checkAuth: async (userId?: string) => {
    try {
      const storedUserId = userId || localStorage.getItem('userId');
      const storedUser = localStorage.getItem('user');

      if (storedUserId) {
        // Try to restore from server first
        const res = await fetch(`/api/auth/me?userId=${storedUserId}`);
        if (res.ok) {
          const data = await res.json();
          const user: User = data.user;
          localStorage.setItem('user', JSON.stringify(user));
          set({ user, isLoggedIn: true, isLoading: false });
          return;
        }
      }

      // Fallback to localStorage cached user
      if (storedUser) {
        try {
          const user: User = JSON.parse(storedUser);
          set({ user, isLoggedIn: true, isLoading: false });
          return;
        } catch {
          // Invalid JSON in localStorage
        }
      }

      set({ user: null, isLoggedIn: false, isLoading: false });
    } catch {
      // On error, try localStorage fallback
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user: User = JSON.parse(storedUser);
          set({ user, isLoggedIn: true, isLoading: false });
          return;
        } catch {
          // Invalid JSON
        }
      }
      set({ user: null, isLoggedIn: false, isLoading: false });
    }
  },
}));
