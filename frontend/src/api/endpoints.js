import { jikan } from '../features/anime-catalog/services/jikanClient';
import { filterHentai } from '../features/anime-catalog/utils/filters';

// NOTE: jikan.get() returns res.data (the Jikan JSON payload) directly,
// not the full axios response. So payload.data is the anime array,
// and payload itself has pagination metadata.

// Fetch top anime with pagination (page = 1,2,3...)
export const fetchTopAnime = async (page = 1, filter = 'airing') => {
  const payload = await jikan.get('/top/anime', { page, filter, limit: 25 });
  payload.data = filterHentai(payload.data);
  return payload;
};

// Search anime by query string
export const searchAnime = async (query, page = 1) => {
  const payload = await jikan.get('/anime', { q: query, page, limit: 25 });
  payload.data = filterHentai(payload.data);
  return payload;
};

// Get full details for a single anime by MAL ID
export const fetchAnimeById = async (id) => {
  const payload = await jikan.get(`/anime/${id}/full`);
  return payload.data;
};

// Get characters for an anime
export const fetchAnimeCharacters = async (id) => {
  const payload = await jikan.get(`/anime/${id}/characters`);
  return payload.data;
};

// Get seasonal anime (current season is the default)
export const fetchSeasonalAnime = async (year, season, page = 1) => {
  const payload = await jikan.get(`/seasons/${year}/${season}`, { page, limit: 25 });
  return payload;
};

// Get anime recommendations (similar titles)
export const fetchRecommendations = async (id) => {
  const payload = await jikan.get(`/anime/${id}/recommendations`);
  return payload.data;
};
