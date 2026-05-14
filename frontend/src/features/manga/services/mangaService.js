import apiClient from '../../../services/api.client';

export const mangaService = {
  async searchManga(query) {
    const res = await apiClient.get('/manga/search', {
      params: { q: query }
    });
    return res.data?.data || res.data || res;
  },

  async getMangaInfo(id, provider) {
    const res = await apiClient.get(`/manga/info/${id}`, {
      params: { provider }
    });
    return res.data?.data || res.data || res;
  },

  async getChapterPages(chapterId, provider) {
    const res = await apiClient.get(`/manga/read/${chapterId}`, {
      params: { provider }
    });
    return res.data?.data || res.data || res;
  }
};
