import jikanClient from './jikanClient';
import { filterHentai } from '../utils/filters';

// Fetch top anime with pagination (page = 1,2,3...)
export const fetchTopAnime = async (page = 1, filter = 'airing') => {
  const response = await jikanClient.get('/top/anime', {
    params: { page, filter, limit: 25 },
  });
  // Filter out explicit content
  response.data.data = filterHentai(response.data.data);
  return response.data;
};

// Search anime by query string
export const searchAnime = async (query, page = 1) => {
  const response = await jikanClient.get('/anime', {
    params: { q: query, page, limit: 25 },
  });
  // Filter out explicit content
  response.data.data = filterHentai(response.data.data);
  return response.data;
};

// Get full details for a single anime by MAL ID
export const fetchAnimeById = async (id) => {
  const response = await jikanClient.get(`/anime/${id}/full`);
  return response.data.data;
};

// Get characters for an anime
export const fetchAnimeCharacters = async (id) => {
  const response = await jikanClient.get(`/anime/${id}/characters`);
  return response.data.data;
};

// Get seasonal anime (current season is the default)
export const fetchSeasonalAnime = async (year, season, page = 1) => {
  const response = await jikanClient.get(`/seasons/${year}/${season}`, {
    params: { page, limit: 25 },
  });
  return response.data;
};

// Get anime recommendations (similar titles)
export const fetchRecommendations = async (id) => {
  const response = await jikanClient.get(`/anime/${id}/recommendations`);
  return response.data.data;
};
