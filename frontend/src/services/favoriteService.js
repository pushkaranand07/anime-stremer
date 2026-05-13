import apiClient from './api.client';

export const favoriteService = {
  async getFavorites(page = 1, limit = 20) {
    return await apiClient.get('/favorites', {
      params: { page, limit }
    });
  },

  async addFavorite(anime) {
    // Map Jikan anime object to our backend schema
    const favoriteData = {
      animeId: String(anime.mal_id),
      title: anime.title,
      imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      malId: String(anime.mal_id)
    };
    return await apiClient.post('/favorites', favoriteData);
  },

  async removeFavorite(animeId) {
    return await apiClient.delete(`/favorites/${animeId}`);
  }
};
