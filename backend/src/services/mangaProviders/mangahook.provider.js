const axios = require('axios');
const logger = require('../../utils/logger');

class MangaHookProvider {
  constructor() {
    this.baseUrl = process.env.MANGAHOOK_API_URL || 'http://localhost:4000';
    if (this.baseUrl.endsWith('/')) {
      this.baseUrl = this.baseUrl.slice(0, -1);
    }
  }

  async request(path, params = {}) {
    const url = `${this.baseUrl}${path}`;
    logger.info(`[MangaHookProvider] GET ${url} params=${JSON.stringify(params)}`);

    const response = await axios.get(url, {
      params,
      timeout: 8000,
    });

    if (response.status !== 200) {
      throw new Error(`Mangahook API returned status ${response.status}`);
    }

    return response.data;
  }

  normalizeSearchResult(item) {
    return {
      id: item.id || item.slug || item.mangaId,
      title: item.title || item.name,
      image: item.image || item.cover || item.thumbnail,
      provider: 'Mangahook',
    };
  }

  async search(query) {
    const result = await this.request('/search', { q: query });
    const items = result?.results || result?.data || [];

    return {
      results: items.map(item => this.normalizeSearchResult(item)).filter(item => item.id && item.title),
    };
  }

  async fetchMangaInfo(id) {
    const result = await this.request(`/info/${encodeURIComponent(id)}`);
    const data = result?.data || result;

    if (!data) {
      throw new Error('Invalid Mangahook info response');
    }

    return {
      id: data.id || id,
      title: data.title || data.name,
      image: data.image || data.cover || data.thumbnail,
      description: data.description || data.synopsis || data.summary,
      genres: data.genres || data.tags || [],
      status: data.status || data.state || 'Unknown',
      releaseDate: data.releaseDate || data.published || null,
      chapters: (data.chapters || []).map(chapter => ({
        id: chapter.id || chapter.chapterId || chapter.slug,
        title: chapter.title || chapter.name || `Chapter ${chapter.number || chapter.chapter}`,
        number: chapter.number || chapter.chapter,
        releaseDate: chapter.releaseDate || chapter.uploaded || null,
      })),
    };
  }

  async fetchChapterPages(chapterId) {
    const result = await this.request(`/read/${encodeURIComponent(chapterId)}`);
    const pages = result?.pages || result;

    if (!Array.isArray(pages)) {
      throw new Error('Invalid Mangahook chapter pages response');
    }

    return pages.map(page => ({
      img: page.img || page.image || page.url,
    }));
  }
}

module.exports = MangaHookProvider;
