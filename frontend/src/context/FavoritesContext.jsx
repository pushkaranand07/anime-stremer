import { createContext, useContext } from 'react';
import { useFavoritesBackend } from '../hooks/useFavoritesBackend';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
  } = useFavoritesBackend(isAuthenticated);  // ← gated by auth state

  return (
    <FavoritesContext.Provider value={{ favorites, isLoading, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}
