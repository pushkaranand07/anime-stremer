const favoriteRepository = require('../../repositories/favorite.repository');
const ApiError = require('../../utils/ApiError');

class FavoriteService {
  async getFavorites(userId, options) {
    return await favoriteRepository.findByUserId(userId, options);
  }

  async addFavorite(userId, favoriteData) {
    const exists = await favoriteRepository.exists(userId, favoriteData.animeId);
    if (exists) {
      throw new ApiError(409, 'Anime already in favorites');
    }

    return await favoriteRepository.create({
      userId,
      ...favoriteData,
    });
  }

  async removeFavorite(userId, animeId) {
    const deleted = await favoriteRepository.deleteOne(userId, animeId);
    if (!deleted) {
      throw new ApiError(404, 'Favorite not found');
    }
    return deleted;
  }
}

module.exports = new FavoriteService();
