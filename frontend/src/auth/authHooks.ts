import { useCallback } from 'react';
import { useAuthStore } from './authStore';
import { axiosInstance } from './axiosInterceptor';

export function useAuth() {
  const { user, accessToken, isAuthenticated, isInitializing, setAuth, clearAuth } = useAuthStore();

  const login = useCallback(async (credentials: any) => {
    try {
      const response: any = await axiosInstance.post('/auth/login/', credentials);
      if (response && response.access_token) {
        setAuth(response.user, response.access_token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }, [setAuth]);

  const signup = useCallback(async (userData: any) => {
    try {
      const response: any = await axiosInstance.post('/auth/register/', userData);
      if (response && response.access_token) {
        setAuth(response.user, response.access_token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }, [setAuth]);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/auth/logout/', {});
    } catch (e) {
      // Graceful local cleanup on network error
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isInitializing,
    login,
    signup,
    logout,
  };
}
