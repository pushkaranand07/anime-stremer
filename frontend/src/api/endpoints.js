import { jikan } from '../features/anime-catalog/services/jikanClient';
import { kitsuService } from '../services/kitsuService';
import { filterHentai } from '../features/anime-catalog/utils/filters';

export const fetchTopAnime = async (page = 1, filter = 'airing') => {
  const payload = await jikan.get('/top/anime', { page, filter, limit: 25 });
  const data = Array.isArray(payload.data) ? payload.data : [];
  return { ...payload, data: filterHentai(data) };
};

export const searchAnime = async (query, page = 1) => {
  const payload = await jikan.get('/anime', { q: query, page, limit: 25 });
  const data = Array.isArray(payload.data) ? payload.data : [];
  return { ...payload, data: filterHentai(data) };
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
  const payload = await jikan.get(`/anime/${id}/full`);
  return payload.data;
};

export const fetchAnimeCharacters = async (id) => {
  const payload = await jikan.get(`/anime/${id}/characters`);
  return payload.data || [];
};

export const fetchSeasonalAnime = async (year, season, page = 1) => {
  const payload = await jikan.get(`/seasons/${year}/${season}`, { page, limit: 25 });
  return payload;
};

export const fetchRecommendations = async (id) => {
  const payload = await jikan.get(`/anime/${id}/recommendations`);
  return payload.data || [];
};
