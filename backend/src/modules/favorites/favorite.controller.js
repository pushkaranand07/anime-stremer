const favoriteService = require('./favorite.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const getFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { page, limit } = req.query;
  const result = await favoriteService.getFavorites(userId, { page: parseInt(page), limit: parseInt(limit) });
  res.status(200).json(new ApiResponse(200, 'Favorites fetched', result));
});

const addFavorite = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const result = await favoriteService.addFavorite(userId, req.body);
  res.status(201).json(new ApiResponse(201, 'Added to favorites', result));
});

const removeFavorite = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { animeId } = req.params;
  await favoriteService.removeFavorite(userId, animeId);
  res.status(200).json(new ApiResponse(200, 'Removed from favorites'));
});

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};
