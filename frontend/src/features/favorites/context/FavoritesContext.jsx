import { createContext, useContext } from 'react';
import { useFavoritesBackend } from '../hooks/useFavoritesBackend';
import { useAuth } from '../../auth/context/AuthContext';

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
    isMutating, // Exposed so buttons can disable during mutation
  } = useFavoritesBackend(isAuthenticated);

  return (
    <FavoritesContext.Provider value={{ favorites, isLoading, addFavorite, removeFavorite, isFavorite, isMutating }}>
      {children}
    </FavoritesContext.Provider>
  );
}
