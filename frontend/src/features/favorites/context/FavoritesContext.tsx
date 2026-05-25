import React, { createContext, useContext } from 'react';
import { useFavoritesBackend } from '../hooks/useFavoritesBackend';
import { useAuth } from '../../../auth/authHooks';

interface FavoritesContextType {
  favorites: any[];
  isLoading: boolean;
  addFavorite: (anime: any) => void;
  removeFavorite: (animeId: string | number) => void;
  isFavorite: (animeId: string | number) => boolean;
  isMutating: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
};

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  const {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    isMutating,
  } = useFavoritesBackend(isAuthenticated);

  return (
    <FavoritesContext.Provider value={{ favorites, isLoading, addFavorite, removeFavorite, isFavorite, isMutating }}>
      {children}
    </FavoritesContext.Provider>
  );
}
export default FavoritesContext;
