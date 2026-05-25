import apiClient from '../services/api.client';
import { kitsuService } from '../services/kitsuService';
import { mal, hasMalClientId } from '../features/anime-catalog/services/malClient';
import { filterHentai } from '../features/anime-catalog/utils/filters';

// NOTE: Manga and Kitsu-specific features now use the Django backend proxy.

export const fetchTopAnime = async (page = 1, filter = 'airing') => {
  const payload = await apiClient.get('/catalog/top/anime', {
    params: { page, filter, limit: 25 },
  });
  payload.data = filterHentai(payload.data);
  return payload;
};

export const searchAnime = async (query, page = 1) => {
  const payload = await apiClient.get('/catalog/anime', {
    params: { q: query, page, limit: 25 },
  });
  payload.data = filterHentai(payload.data);
  return payload;
};

export const searchManga = async (query, page = 1) => {
  const params = {
    'filter[text]': query,
    'page[limit]': 25,
    'page[offset]': (page - 1) * 25,
  };
  const payload = await kitsuService.getManga(params);
  return {
    data: payload.items,
    pagination: {
      items: {
        total: payload.meta?.count || 0,
      },
    },
  };
};

export const fetchMangaById = async (id) => {
  return kitsuService.getMangaById(id);
};

export const fetchMangaChapters = async (id) => {
  return kitsuService.getMangaChapters(id, { 'page[limit]': 100, sort: 'number' });
};

export const fetchMangaCharacters = async (id) => {
  const response = await fetch(`https://kitsu.io/api/edge/manga/${id}/characters?include=character&page[limit]=12`);
  const payload = await response.json();
  if (!payload.data) return [];
  const includedCharacters = payload.included || [];
  return payload.data.map((mediaChar) => {
    const charId = mediaChar.relationships?.character?.data?.id;
    const charData = includedCharacters.find((c) => c.type === 'characters' && c.id === charId);
    return {
      role: mediaChar.attributes?.role || 'Supporting',
      character: {
        id: charId,
        name: charData?.attributes?.canonicalName || charData?.attributes?.name || 'Unknown Character',
        image: charData?.attributes?.image?.medium || charData?.attributes?.image?.original || '/api/placeholder/120/120',
      },
    };
  });
};

export const fetchAnimeById = async (id) => {
  const payload = await apiClient.get(`/catalog/anime/${id}/full`);
  return payload.data;
};

export const fetchAnimeCharacters = async (id) => {
  const payload = await apiClient.get(`/catalog/anime/${id}/characters`);
  return payload.data;
};

export const fetchSeasonalAnime = async (year, season, page = 1) => {
  const payload = await apiClient.get(`/catalog/seasons/${year}/${season}`, {
    params: { page, limit: 25 },
  });
  return payload;
};

export const fetchRecommendations = async (id) => {
  const payload = await apiClient.get(`/catalog/anime/${id}/recommendations`);
  return payload.data;
};
