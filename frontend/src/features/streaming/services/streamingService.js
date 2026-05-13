import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/streaming';

export const streamingService = {
  /**
   * Fetches anime info and episode list from the backend
   * @param {string} title 
   */
  async getAnimeInfo(title) {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/info`, {
        params: { q: title }
      });
      return data;
    } catch (error) {
      console.error('[StreamingService] getAnimeInfo error:', error);
      throw error;
    }
  },

  /**
   * Fetches playable sources for a specific episode
   * @param {string} episodeId 
   * @param {string} provider 
   * @param {string} subOrDub 
   */
  async getEpisodeSources(episodeId, provider, subOrDub = 'sub') {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/watch/${encodeURIComponent(episodeId)}`, {
        params: { provider, subOrDub }
      });
      return data;
    } catch (error) {
      console.error('[StreamingService] getEpisodeSources error:', error);
      throw error;
    }
  }
};
