import { axiosInstance } from '../auth/axiosInterceptor';

const BASE = '/api/v1';

const normalizeJsonApiData = (payload) => {
  if (!payload || !payload.data) return [];
  return payload.data.map((item) => ({
    id: item.id,
    ...item.attributes,
    relationships: item.relationships,
  }));
};

const normalizeJsonApiItem = (payload) => {
  if (!payload || !payload.data) return null;
  return {
    id: payload.data.id,
    ...payload.data.attributes,
    relationships: payload.data.relationships,
  };
};

export const kitsuService = {
  login: (username, password) =>
    axiosInstance.post(`${BASE}/auth/login/`, { username, password }),

  refreshToken: () => axiosInstance.post(`${BASE}/auth/refresh/`, {}),

  getManga: (params = {}) =>
    axiosInstance.get(`${BASE}/manga/`, { params }).then((payload) => ({
      ...payload,
      items: normalizeJsonApiData(payload),
    })),

  getMangaById: (id, params = {}) =>
    axiosInstance.get(`${BASE}/manga/${id}/`, { params }).then((payload) => normalizeJsonApiItem(payload)),

  getMangaChapters: (mangaId, params = {}) =>
    axiosInstance.get(`${BASE}/manga/${mangaId}/chapters/`, { params }).then((payload) => normalizeJsonApiData(payload)),

  getTrendingManga: (params = {}) =>
    axiosInstance.get(`${BASE}/manga/trending/`, { params }).then((payload) => normalizeJsonApiData(payload)),

  getStreamers: (params = {}) =>
    axiosInstance.get(`${BASE}/streamers/`, { params }).then((payload) => normalizeJsonApiData(payload)),

  getAnimeStreaming: (animeId, params = {}) =>
    axiosInstance.get(`${BASE}/anime/${animeId}/streaming/`, { params }).then((payload) => payload),

  getEpisodes: (animeId, params = {}) =>
    axiosInstance.get(`${BASE}/anime/${animeId}/episodes/`, { params }).then((payload) => normalizeJsonApiData(payload)),

  filterAnime: (filters = {}) =>
    axiosInstance.get(`${BASE}/anime/`, { params: filters }).then((payload) => payload),

  filterManga: (filters = {}) =>
    axiosInstance.get(`${BASE}/manga/`, { params: filters }).then((payload) => ({
      ...payload,
      items: normalizeJsonApiData(payload),
    })),
};
