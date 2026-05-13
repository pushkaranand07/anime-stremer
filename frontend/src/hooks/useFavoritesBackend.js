import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFavorites, addFavoriteToDB, removeFavoriteFromDB } from '../services/favoriteService';

export const useFavoritesBackend = (isAuthenticated = false) => {
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,   // Only fetch when user is logged in
    retry: false,               // Don't retry 401s
  });

  const addMutation = useMutation({
    mutationFn: addFavoriteToDB,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    onError: (err) => console.error('Add favorite error:', err.response?.data || err.message),
  });

  const removeMutation = useMutation({
    mutationFn: (animeId) => removeFavoriteFromDB(animeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    onError: (err) => console.error('Remove favorite error:', err.response?.data || err.message),
  });

  const isFavorite = (animeId) => {
    return favorites.some(fav => fav.anime_id === Number(animeId));
  };

  return {
    favorites,
    isLoading,
    error,
    addFavorite: addMutation.mutate,
    removeFavorite: removeMutation.mutate,
    isFavorite,
    isMutating: addMutation.isPending || removeMutation.isPending,
  };
};
