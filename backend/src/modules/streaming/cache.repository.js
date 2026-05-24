const CacheEntry = require('./CacheEntry.model');

class CacheRepository {
  async get(cacheKey) {
    const entry = await CacheEntry.findOne({ cacheKey }).lean();
    return entry ? entry.data : null;
  }

  async set(cacheKey, data, ttlSeconds) {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    return await CacheEntry.findOneAndUpdate(
      { cacheKey },
      { data, expiresAt },
      { upsert: true, new: true }
    ).lean();
  }

  async delete(cacheKey) {
    return await CacheEntry.deleteOne({ cacheKey });
  }

  async clearAll() {
    return await CacheEntry.deleteMany({});
  }
}

module.exports = new CacheRepository();
