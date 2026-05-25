import { createContext, useState, useEffect, useMemo } from 'react';
import { axiosInstance } from './axiosInterceptor';
import { useAuthStore } from './authStore';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user, accessToken, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [refreshTimeout, setRefreshTimeout] = useState(null);

  useEffect(() => {
    setIsInitializing(false);
    return () => {
      if (refreshTimeout) {
        window.clearTimeout(refreshTimeout);
      }
    };
  }, []);

  const scheduleRefresh = (expiresIn) => {
    if (refreshTimeout) {
      window.clearTimeout(refreshTimeout);
    }

    const refreshDelay = Math.max((expiresIn || 1500) - 60, 30) * 1000;
    const timeoutId = window.setTimeout(async () => {
      try {
        await refreshToken();
      } catch (error) {
        clearAuth();
      }
    }, refreshDelay);

    setRefreshTimeout(timeoutId);
  };

  const login = async ({ username, email, password }) => {
    const response = await axiosInstance.post('/auth/login/', {
      username: username || email,
      password,
    });

    if (response?.access_token) {
      setAuth({ username: response.user?.username || username || email || '' }, response.access_token);
      if (response.expires_in) {
        scheduleRefresh(response.expires_in);
      }
    }

    return response;
  };

  const refreshToken = async () => {
    const response = await axiosInstance.post('/auth/refresh/', {});
    if (response?.access_token) {
      setAuth({ username: response.user?.username || user?.username || '' }, response.access_token);
      if (response.expires_in) {
        scheduleRefresh(response.expires_in);
      }
    }
    return response;
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout/', {});
    } catch (_) {
      // Ignore network failures, clear local state anyway
    }
    clearAuth();
    if (refreshTimeout) {
      window.clearTimeout(refreshTimeout);
    }
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated,
      isInitializing,
      login,
      refreshToken,
      logout,
    }),
    [user, accessToken, isAuthenticated, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
