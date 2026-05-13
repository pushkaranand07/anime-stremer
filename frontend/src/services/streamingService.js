import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api/streaming' });

/**
 * Search for a streaming anime by title and get its episode list.
 * @param {string} title - The anime title from Jikan/MAL
 * @returns {Promise<{provider, id, title, episodes, hasDub, ...}>}
 */
export const fetchStreamingInfo = async (title) => {
  if (!title) return null;
  const response = await api.get('/info', { params: { q: title } });
  return response.data;
};

/**
 * Fetch playable video sources for an episode.
 * @param {string} episodeId - Provider-specific episode ID
 * @param {string} provider - Which provider returned the episode (e.g. 'Hianime')
 * @param {'sub'|'dub'} subOrDub - Preferred audio track
 */
export const fetchEpisodeSources = async (episodeId, provider = 'Hianime', subOrDub = 'sub') => {
  if (!episodeId) return null;
  const response = await api.get(`/watch/${encodeURIComponent(episodeId)}`, {
    params: { provider, subOrDub },
  });
  return response.data;
};
