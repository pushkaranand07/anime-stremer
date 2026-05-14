import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';

// Auth states: 'initializing' | 'authenticated' | 'unauthenticated'
const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState('initializing'); // explicit state machine
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  // ── Boot: verify token on startup ────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setAuthState('unauthenticated');
      return;
    }

    // Decode JWT without verifying signature (check expiry only)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        // Token is expired — try to refresh silently
        _silentRefresh();
      } else {
        // Token looks valid — trust it and restore user from storage
        const storedUser = localStorage.getItem('user');
        setUser(storedUser ? JSON.parse(storedUser) : null);
        setAuthState('authenticated');
      }
    } catch {
      // Malformed token — treat as unauthenticated
      _clearStorage();
      setAuthState('unauthenticated');
    }
  }, []);

  const _silentRefresh = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      _clearStorage();
      setAuthState('unauthenticated');
      return;
    }

    try {
      const response = await authService.refreshToken(refreshToken);
      // response is already unwrapped by apiClient interceptor → ApiResponse wrapper
      const newToken = response?.data?.accessToken;
      if (!newToken) throw new Error('No token in refresh response');

      localStorage.setItem('token', newToken);
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
      setAuthState('authenticated');
    } catch {
      _clearStorage();
      setAuthState('unauthenticated');
    }
  };

  const _clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  // ── Public actions ────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    // response.data = { user, accessToken, refreshToken }
    const { user: userData, accessToken, refreshToken } = response.data;

    setUser(userData);
    setAuthState('authenticated');
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    queryClient.invalidateQueries({ queryKey: ['favorites'] });
    return response;
  }, [queryClient]);

  const signup = useCallback(async (userData) => {
    const response = await authService.signup(userData);
    const { user: newUser, accessToken, refreshToken } = response.data;

    setUser(newUser);
    setAuthState('authenticated');
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    queryClient.invalidateQueries({ queryKey: ['favorites'] });
    return response;
  }, [queryClient]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await authService.logout(refreshToken); // Revoke server-side
    } catch {
      // Even if the server call fails, clear local state
    }

    setUser(null);
    setAuthState('unauthenticated');
    _clearStorage();
    queryClient.removeQueries({ queryKey: ['favorites'] });
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: authState === 'authenticated',
      isInitializing: authState === 'initializing',
      login,
      logout,
      signup,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
