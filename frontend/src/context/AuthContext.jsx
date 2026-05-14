import { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        // Optionally validate token here, but for now just set loading false
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();
  }, []); // Remove [token] dependency to avoid circularity

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { user, token, refreshToken } = response.data;
      
      setUser(user);
      setToken(token);
      setRefreshToken(refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      const { user, token, refreshToken } = response.data;
      
      setUser(user);
      setToken(token);
      setRefreshToken(refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    queryClient.removeQueries({ queryKey: ['favorites'] });
  };

  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) throw new Error('No refresh token available');
    try {
      const response = await authService.refreshToken(storedRefreshToken);
      const { token: newToken } = response.data;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      return newToken;
    } catch (error) {
      logout(); // If refresh fails, logout
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, signup, refreshToken: refreshAccessToken, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}
