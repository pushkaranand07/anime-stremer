import apiClient from '../../../services/api.client';

/**
 * Builds a URL that routes a raw CDN stream URL through the backend proxy.
 * This solves CORS restrictions on CDN segments.
 * @param {string} rawStreamUrl - The original CDN URL
 * @param {object|null} headers - Optional headers the CDN requires (e.g. Referer)
 * @returns {string} Proxied URL pointing to our backend
 */
function buildProxiedUrl(rawStreamUrl, headers) {
  if (!rawStreamUrl) return rawStreamUrl;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const encoded = encodeURIComponent(rawStreamUrl);
  let url = `${baseUrl}/streaming/proxy?url=${encoded}`;

  if (headers && Object.keys(headers).length > 0) {
    const headersBase64 = btoa(JSON.stringify(headers));
    url += `&headers=${encodeURIComponent(headersBase64)}`;
  }

  return url;
}

export const streamingService = {
  /**
   * Searches providers for a streaming source for the given anime title.
   * Returns episode list, provider name, hasDub flag, etc.
   */
  async getAnimeInfo(query) {
    if (!query) return null;
    // apiClient interceptor returns response.data, which is our ApiResponse wrapper
    // The actual payload is in .data of that wrapper
    const apiResponse = await apiClient.get('/streaming/info', {
      params: { q: query.trim() }
    });
    // apiResponse = { success, statusCode, message, data: { provider, hasDub, episodes, ... } }
    return apiResponse.data ?? apiResponse;
  },

  /**
   * Fetches playable video sources for a specific episode.
   * `provider` should be `episode.provider` — the provider that issued the episode ID.
   * Proxifies all source and subtitle URLs through the backend proxy.
   */
  async getEpisodeSources(episodeId, provider, subOrDub) {
    if (!episodeId) return { sources: [], subtitles: [] };

    try {
      const apiResponse = await apiClient.get(`/streaming/watch/${encodeURIComponent(episodeId)}`, {
        params: { provider, subOrDub }
      });

      // apiResponse = { success, statusCode, message, data: { sources, subtitles, provider, ... } }
      const payload = apiResponse.data ?? apiResponse;

      if (!payload || !Array.isArray(payload.sources)) {
        return { sources: [], subtitles: [] };
      }

      // Proxify every source URL so HLS segments bypass CDN CORS restrictions
      const sources = payload.sources.map(source => ({
        ...source,
        url: buildProxiedUrl(source.url, source.headers ?? null),
      }));

      // Proxify subtitle track URLs as well
      const subtitles = (payload.subtitles || []).map(sub => ({
        ...sub,
        url: buildProxiedUrl(sub.url, null),
      }));

      return {
        ...payload,
        sources,
        subtitles,
      };
    } catch (err) {
      console.error('[streamingService] getEpisodeSources error:', err.message);
      return { sources: [], subtitles: [] };
    }
  },
};
