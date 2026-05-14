import apiClient from '../../../services/api.client';

function buildProxiedUrl(rawStreamUrl, headers) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const encoded = encodeURIComponent(rawStreamUrl);
  let url = `${baseUrl}/streaming/proxy?url=${encoded}`;
  
  if (headers) {
    const headersBase64 = btoa(JSON.stringify(headers));
    url += `&headers=${encodeURIComponent(headersBase64)}`;
  }
  
  return url;
}

export const streamingService = {
  async getAnimeInfo(query) {
    const res = await apiClient.get('/streaming/info', {
      params: { q: query }
    });
    return res.data;
  },

  async getEpisodeSources(episodeId, provider, subOrDub) {
    try {
      const response = await apiClient.get(`/streaming/watch/${episodeId}`, {
        params: { provider, subOrDub }
      });

      const rawData = response.data || response; 
      const apiData = rawData.data || rawData;

      if (!apiData || !apiData.sources) {
        return { sources: [], subtitles: [] };
      }

      const sources = apiData.sources.map(source => ({
        ...source,
        url: buildProxiedUrl(source.url, source.headers)
      }));

      const subtitles = (apiData.subtitles || []).map(sub => ({
        ...sub,
        url: buildProxiedUrl(sub.url)
      }));

      return {
        ...apiData,
        sources,
        subtitles
      };
    } catch (err) {
      console.error('[streamingService] Fetch error:', err.message);
      return { sources: [], subtitles: [] };
    }
  }
};
