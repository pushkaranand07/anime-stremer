import apiClient from '../../../services/api.client';

export const mangaService = {
  async searchManga(query, provider) {
    const params = { q: query };
    if (provider) params.provider = provider;

    const res = await apiClient.get('/manga/search', {
      params,
    });
    return res.data?.data || res.data || res;
  },

  async getMangaInfo(id, provider) {
    const params = { id };
    if (provider) params.provider = provider;

    const res = await apiClient.get('/manga/info', {
      params,
    });
    return res.data?.data || res.data || res;
  },

  async getChapterPages(chapterId, provider) {
    const params = { chapterId };
    if (provider) params.provider = provider;

    const res = await apiClient.get('/manga/read', {
      params,
    });
    return res.data?.data || res.data || res;
  }
};
