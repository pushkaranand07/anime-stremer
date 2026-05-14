const mangaService = require('./manga.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

const searchManga = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) throw new ApiError(400, 'Search query is required');

  const result = await mangaService.searchManga(q);
  res.status(200).json(new ApiResponse(200, 'Manga search results fetched', result));
});

const getMangaInfo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { provider } = req.query; // New: Optional provider param
  if (!id) throw new ApiError(400, 'Manga ID is required');

  const result = await mangaService.getMangaInfo(id, provider || 'MangaPill');
  res.status(200).json(new ApiResponse(200, 'Manga details fetched', result));
});

const getChapterPages = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const { provider } = req.query; // New: Optional provider param
  if (!chapterId) throw new ApiError(400, 'Chapter ID is required');

  const result = await mangaService.getChapterPages(chapterId, provider || 'MangaPill');
  res.status(200).json(new ApiResponse(200, 'Chapter pages fetched', result));
});

module.exports = {
  searchManga,
  getMangaInfo,
  getChapterPages
};
