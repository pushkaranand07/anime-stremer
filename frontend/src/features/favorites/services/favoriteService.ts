import axiosInstance from '../../../auth/axiosInterceptor';

export interface FavoriteItem {
  id?: string;
  anime_id: string;
  title: string;
  image_url?: string;
  mal_id?: string;
  added_at?: string;
}

export const favoriteService = {
  async getFavorites(page: number = 1, limit: number = 20): Promise<any> {
    return await axiosInstance.get('/favorites/', {
      params: { page, limit }
    });
  },

  async addFavorite(anime: any): Promise<any> {
    const favoriteData: FavoriteItem = {
      anime_id: String(anime.mal_id),
      title: anime.title,
      image_url: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || undefined,
      mal_id: String(anime.mal_id),
    };
    return await axiosInstance.post('/favorites/', favoriteData);
  },

  async removeFavorite(animeId: string | number): Promise<any> {
    return await axiosInstance.delete(`/favorites/${animeId}/`);
  }
};
