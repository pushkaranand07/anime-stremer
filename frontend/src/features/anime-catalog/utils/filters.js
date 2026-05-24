// src/utils/filters.js

/**
 * Checks if an anime entry should be filtered out based on explicit content.
 * @param {Object} anime - The anime object from Jikan API.
 * @returns {boolean} - True if it's hentai or explicit.
 */
export const isHentai = (anime) => {
  if (!anime) return false;

  // Check rating
  if (anime.rating === "Rx - Hentai") return true;

  // Check genres (ID 12 = Hentai)
  if (anime.genres && anime.genres.some(genre => genre.mal_id === 12)) return true;

  // Optional: also filter by explicit keywords in title/synopsis
  const explicitKeywords = ['hentai', '18+', 'adult', 'nsfw'];
  const textToCheck = `${anime.title} ${anime.synopsis || ''}`.toLowerCase();
  if (explicitKeywords.some(keyword => textToCheck.includes(keyword))) return true;

  return false;
};

/**
 * Filters a list of anime to remove explicit entries.
 * @param {Array} animeList - Array of anime objects.
 * @returns {Array} - Filtered array.
 */
export const filterHentai = (animeList) => {
  if (!animeList || !Array.isArray(animeList)) return [];
  return animeList.filter(anime => !isHentai(anime));
};
