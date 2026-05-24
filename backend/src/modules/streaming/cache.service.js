const cacheRepository = require('./cache.repository');
const providerConfig = require('./provider.config');

class CacheService {
  async get(key) {
    return await cacheRepository.get(key);
  }

  async set(key, data, ttlSeconds = providerConfig.cacheTtlSeconds) {
    return await cacheRepository.set(key, data, ttlSeconds);
  }

  async delete(key) {
    return await cacheRepository.delete(key);
  }
}

module.exports = new CacheService();
