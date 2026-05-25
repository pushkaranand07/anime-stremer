import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '../services/favoriteService';

export const useFavoritesBackend = (isAuthenticated: boolean = false) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<any, Error>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await favoriteService.getFavorites();
      // Handle Django paginated list structure
      if (response && response.results) {
        return response.results;
      }
      return response || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
    retry: false,
  });

  const favorites = data || [];

  const addMutation = useMutation({
    mutationFn: (animeData: any) => favoriteService.addFavorite(animeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (err: any) => {
      console.error('Add favorite error:', err.response?.data || err.message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (animeId: string | number) => favoriteService.removeFavorite(animeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (err: any) => {
      console.error('Remove favorite error:', err.response?.data || err.message);
    },
  });

  const isFavorite = (animeId: string | number) => {
    return favorites.some((fav: any) => fav.anime_id === String(animeId));
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
