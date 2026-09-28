import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  setInitializing: (status: boolean) => void;
}

/**
 * Auth state store — session cookie edition.
 *
 * There is no accessToken stored here. The Django session cookie (HttpOnly,
 * Secure) is handled entirely by the browser and sent automatically on every
 * request that uses `withCredentials: true`. The frontend only needs to know
 * *who* is logged in, not hold any token.
 */
export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: null,
    isAuthenticated: false,
    isInitializing: true,
    setAuth: (user) => set({ user, isAuthenticated: true, isInitializing: false }),
    clearAuth: () => set({ user: null, isAuthenticated: false, isInitializing: false }),
    setInitializing: (status) => set({ isInitializing: status }),
  }))
);
