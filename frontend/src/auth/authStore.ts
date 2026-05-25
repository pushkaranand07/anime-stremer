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
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setInitializing: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isInitializing: true,
    setAuth: (user, token) => set({ user, accessToken: token, isAuthenticated: true, isInitializing: false }),
    clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false, isInitializing: false }),
    setInitializing: (status) => set({ isInitializing: status }),
  }))
);
