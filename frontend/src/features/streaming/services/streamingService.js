import apiClient from '../../../services/api.client';

function buildProxiedUrl(rawStreamUrl) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const encoded = encodeURIComponent(rawStreamUrl);
  return `${baseUrl}/streaming/proxy?url=${encoded}`;
}

export const streamingService = {
  async getAnimeInfo(query) {
    const res = await apiClient.get('/streaming/info', {
      params: { q: query }
    });
    return res.data;
  },

  async getEpisodeSources(episodeId, provider, subOrDub) {
    const response = await apiClient.get(`/streaming/watch/${episodeId}`, {
      params: { provider, subOrDub }
    });

    const res = response.data;

    if (res.sources) {
      res.sources = res.sources.map(source => ({
        ...source,
        url: buildProxiedUrl(source.url),
      }));
    }

    if (res.subtitles) {
      res.subtitles = res.subtitles.map(sub => ({
        ...sub,
        url: buildProxiedUrl(sub.url),
      }));
    }

    return res;
  }
};
