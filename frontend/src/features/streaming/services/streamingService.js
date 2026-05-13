import apiClient from '../../../services/api.client';

export const streamingService = {
  async getAnimeInfo(query) {
    return await apiClient.get('/streaming/info', {
      params: { q: query }
    });
  },

  async getEpisodeSources(episodeId, provider, subOrDub) {
    return await apiClient.get(`/streaming/watch/${episodeId}`, {
      params: { provider, subOrDub }
    });
  }
};
