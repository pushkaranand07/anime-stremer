import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '../services/favoriteService';

export const useFavoritesBackend = (isAuthenticated = false) => {
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteService.getFavorites(),
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,   // Only fetch when user is logged in
    retry: false,               // Don't retry 401s
  });

  const addMutation = useMutation({
    mutationFn: (animeData) => favoriteService.addFavorite(animeData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    onError: (err) => console.error('Add favorite error:', err.response?.data || err.message),
  });

  const removeMutation = useMutation({
    mutationFn: (animeId) => favoriteService.removeFavorite(animeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    onError: (err) => console.error('Remove favorite error:', err.response?.data || err.message),
  });

  const isFavorite = (animeId) => {
    return favorites.some(fav => fav.animeId === String(animeId));
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
