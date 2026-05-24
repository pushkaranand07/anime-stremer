const Favorite = require('./Favorite.model');

class FavoriteRepository {
  async findByUserId(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    return await Favorite.paginate({ userId }, { page, limit, sort: { addedAt: -1 }, lean: true });
  }

  async create(favoriteData) {
    const favorite = new Favorite(favoriteData);
    const savedFavorite = await favorite.save();
    return savedFavorite.toObject();
  }

  async deleteOne(userId, animeId) {
    return await Favorite.findOneAndDelete({ userId, animeId }).lean();
  }

  async exists(userId, animeId) {
    return await Favorite.exists({ userId, animeId });
  }

  async findAllByUserId(userId) {
    return await Favorite.find({ userId }).sort({ addedAt: -1 }).lean();
  }
}

module.exports = new FavoriteRepository();
