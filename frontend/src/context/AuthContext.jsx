import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser) setUser(savedUser);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    // Invalidate favorites cache so they reload for this user
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    // Clear cached favorites so they don't show for the next user
    queryClient.removeQueries({ queryKey: ['favorites'] });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}
