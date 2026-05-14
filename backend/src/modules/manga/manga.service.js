const { MANGA } = require('@consumet/extensions');
const logger = require('../../utils/logger');
const ApiError = require('../../utils/ApiError');

class MangaService {
  constructor() {
    this.providers = {
      MangaPill: null,
      MangaDex: null,
      MangaKakalot: null
    };
  }

  getProvider(name) {
    if (!this.providers[name]) {
      try {
        const klass = MANGA[name];
        if (klass) {
          this.providers[name] = new klass();
          logger.info(`[MangaService] Initialized provider: ${name}`);
        }
      } catch (err) {
        logger.error(`[MangaService] Failed to init ${name}: ${err.message}`);
      }
    }
    return this.providers[name];
  }

  async searchManga(query) {
    // Try providers in order of reliability
    const chain = ['MangaPill', 'MangaKakalot', 'MangaDex'];
    
    for (const name of chain) {
      try {
        const provider = this.getProvider(name);
        if (!provider) continue;

        logger.info(`[MangaService] Searching ${name} for: "${query}"`);
        const results = await provider.search(query);
        
        if (results && results.results && results.results.length > 0) {
          logger.info(`[MangaService] SUCCESS: ${name} found ${results.results.length} items`);
          // Tag results with provider for info routing
          results.results = results.results.map(r => ({ ...r, provider: name }));
          return results;
        }
      } catch (err) {
        logger.warn(`[MangaService] ${name} search failed: ${err.message}`);
      }
    }

    throw new ApiError(500, 'All manga providers failed to return results');
  }

  async getMangaInfo(mangaId, providerName = 'MangaPill') {
    try {
      const provider = this.getProvider(providerName);
      if (!provider) throw new Error(`Provider ${providerName} not found`);

      logger.info(`[MangaService] Fetching info from ${providerName} for ID: ${mangaId}`);
      const info = await provider.fetchMangaInfo(mangaId);
      return { ...info, provider: providerName };
    } catch (err) {
      logger.error(`[MangaService] Fetch info failed for ${providerName}: ${err.message}`);
      // If primary info fetch fails, we can't easily fallback because IDs are provider-specific
      throw new ApiError(500, `Failed to fetch manga details: ${err.message}`);
    }
  }

  async getChapterPages(chapterId, providerName = 'MangaPill') {
    try {
      const provider = this.getProvider(providerName);
      if (!provider) throw new Error(`Provider ${providerName} not found`);

      logger.info(`[MangaService] Fetching pages from ${providerName} for chapter: ${chapterId}`);
      return await provider.fetchChapterPages(chapterId);
    } catch (err) {
      logger.error(`[MangaService] Fetch pages failed: ${err.message}`);
      throw new ApiError(500, 'Failed to fetch chapter pages');
    }
  }
}

module.exports = new MangaService();
