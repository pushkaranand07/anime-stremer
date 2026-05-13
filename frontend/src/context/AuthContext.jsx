import { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        localStorage.setItem('token', token);
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) setUser(savedUser);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    queryClient.removeQueries({ queryKey: ['favorites'] });
  };

  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, signup, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}
