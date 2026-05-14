const { MANGA } = require('@consumet/extensions');
const logger = require('../../utils/logger');
const ApiError = require('../../utils/ApiError');
const MangaHookProvider = require('../../services/mangaProviders/mangahook.provider');

class MangaService {
  // Providers that serve images with strict Referer requirements (need backend proxy)
  static PROXY_REQUIRED_PROVIDERS = new Set(['MangaPill', 'MangaKakalot', 'Mangahook']);

  constructor() {
    this.providers = {
      MangaPill: null,
      Mangahook: null,
      MangaDex: null,
      MangaKakalot: null
    };

    // Validate API_BASE_URL in production so proxy URLs are correct
    this.baseUrl = process.env.API_BASE_URL;
    if (!this.baseUrl) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('[MangaService] API_BASE_URL environment variable is required in production for manga image proxification');
      }
      this.baseUrl = 'http://localhost:5000/api/v1';
    }
    // Strip trailing slash
    this.baseUrl = this.baseUrl.replace(/\/$/, '');
  }

  proxify(url, providerName = 'MangaPill') {
    if (!url) return url;

    // Skip proxification for providers that already support CORS (e.g. MangaDex CDN)
    if (!MangaService.PROXY_REQUIRED_PROVIDERS.has(providerName)) {
      return url;
    }

    const headers = {};
    if (providerName === 'MangaPill') {
      headers['Referer'] = 'https://mangapill.com/';
    } else if (providerName === 'MangaKakalot') {
      headers['Referer'] = 'https://chapmanganato.com/';
    } else if (providerName === 'Mangahook') {
      headers['Referer'] = process.env.MANGAHOOK_API_URL || 'http://localhost:4000';
    }

    const headersBase64 = Buffer.from(JSON.stringify(headers)).toString('base64');
    return `${this.baseUrl}/streaming/proxy?url=${encodeURIComponent(url)}&headers=${encodeURIComponent(headersBase64)}`;
  }

  getProvider(name) {
    if (!this.providers[name]) {
      try {
        if (name === 'Mangahook') {
          this.providers[name] = new MangaHookProvider();
          logger.info(`[MangaService] Initialized provider: ${name}`);
        } else {
          const klass = MANGA[name];
          if (klass) {
            this.providers[name] = new klass();
            logger.info(`[MangaService] Initialized provider: ${name}`);
          }
        }
      } catch (err) {
        logger.error(`[MangaService] Failed to init ${name}: ${err.message}`);
      }
    }
    return this.providers[name];
  }

  async searchManga(query, providerName) {
    const providerChain = ['MangaPill', 'Mangahook', 'MangaKakalot', 'MangaDex'];
    const searchOrder = providerName ? [providerName] : providerChain;

    if (providerName && !providerChain.includes(providerName)) {
      throw new ApiError(400, `Unsupported manga provider: ${providerName}`);
    }

    for (const name of searchOrder) {
      try {
        const provider = this.getProvider(name);
        if (!provider) continue;

        logger.info(`[MangaService] Searching ${name} for: "${query}"`);
        const results = await provider.search(query);

        if (results && results.results && results.results.length > 0) {
          logger.info(`[MangaService] SUCCESS: ${name} found ${results.results.length} items`);
          // Tag results with provider and proxify images
          results.results = results.results.map(r => ({ 
            ...r, 
            provider: name,
            image: this.proxify(r.image, name)
          }));
          return results;
        }
      } catch (err) {
        logger.warn(`[MangaService] ${name} search failed: ${err.message}`);
      }
    }

    return { results: [] };
  }

  async getMangaInfo(mangaId, providerName = 'MangaPill') {
    try {
      const provider = this.getProvider(providerName);
      if (!provider) throw new Error(`Provider ${providerName} not found`);

      logger.info(`[MangaService] Fetching info from ${providerName} for ID: ${mangaId}`);
      const info = await provider.fetchMangaInfo(mangaId);
      return { 
        ...info, 
        provider: providerName,
        image: this.proxify(info.image, providerName),
        chapters: (info.chapters || []).map(chapter => ({
          ...chapter,
          chapterNumber: chapter.number || chapter.chapter || chapter.chapterNumber,
          number: chapter.number || chapter.chapter || chapter.chapterNumber,
        })),
      };
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
      const pages = await provider.fetchChapterPages(chapterId);
      // Proxify each page image and add a stable page index
      return pages.map((page, index) => ({
        ...page,
        img: this.proxify(page.img || page.image || page.url, providerName),
        page: page.page || page.pageNumber || index + 1,
      }));
    } catch (err) {
      logger.error(`[MangaService] Fetch pages failed: ${err.message}`);
      throw new ApiError(500, 'Failed to fetch chapter pages');
    }
  }
}

module.exports = new MangaService();
