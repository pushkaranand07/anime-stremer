import apiClient from '../../../services/api.client';

export const favoriteService = {
  async getFavorites(page = 1, limit = 20) {
    return await apiClient.get('/favorites', {
      params: { page, limit }
    });
  },

  async addFavorite(anime) {
    // Map the full Jikan anime object to our backend Favorite schema
    const favoriteData = {
      animeId: String(anime.mal_id),
      title: anime.title,
      imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || null,
      malId: String(anime.mal_id),
      score: typeof anime.score === 'number' ? anime.score : null,
      episodes: typeof anime.episodes === 'number' ? anime.episodes : null,
      type: anime.type || null,
      genres: Array.isArray(anime.genres) ? anime.genres.map(g => g.name).filter(Boolean) : [],
    };
    return await apiClient.post('/favorites', favoriteData);
  },

  async removeFavorite(animeId) {
    return await apiClient.delete(`/favorites/${animeId}`);
  }
};
