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

  async addFavorite(item: any): Promise<any> {
    const isManga = item.type === 'manga' || item.type === 'manhua' || item.type === 'manhwa' || !!item.attributes;
    const itemId = isManga ? String(item.id) : String(item.mal_id);
    const title = isManga ? (item.attributes?.canonicalTitle || item.title) : item.title;
    const imageUrl = isManga 
      ? (item.attributes?.posterImage?.large || item.attributes?.posterImage?.medium || item.image)
      : (item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || item.image);

    const favoriteData: FavoriteItem = {
      anime_id: itemId,
      title: title,
      image_url: imageUrl || undefined,
      mal_id: itemId,
    };
    return await axiosInstance.post('/favorites/', favoriteData);
  },

  async removeFavorite(animeId: string | number): Promise<any> {
    return await axiosInstance.delete(`/favorites/${animeId}/`);
  }
};
