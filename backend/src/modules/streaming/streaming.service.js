const cacheService = require('./cache.service');
const providerService = require('./provider.service');
const providerConfig = require('../../config/provider.config');

class StreamingService {
  async getAnimeInfo(query) {
    const cacheKey = `info:${query.toLowerCase().trim()}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const info = await providerService.fetchAnimeInfo(query);

    // Look up hasDub capability for the provider that responded
    const matchingProvider = providerConfig.chain.find(p => p.name === info.provider);

    const result = {
      provider: info.provider,
      hasDub: matchingProvider?.hasDub || false,
      id: info.id,
      title: info.title,
      image: info.image,
      description: info.description,
      episodes: info.episodes.map(ep => ({
        id: ep.id,
        number: ep.number,
        title: ep.title || `Episode ${ep.number}`,
        isFiller: ep.isFiller || false,
      })),
    };

    await cacheService.set(cacheKey, result);
    return result;
  }

  async getEpisodeSources(episodeId, provider, subOrDub) {
    const cacheKey = `watch:${episodeId}:${provider}:${subOrDub}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const sourcesData = await providerService.fetchEpisodeSources(episodeId, provider, subOrDub);

    const result = {
      provider: sourcesData.provider,
      subOrDub: subOrDub,
      sources: sourcesData.sources || [],
      subtitles: sourcesData.subtitles || [],
      intro: sourcesData.intro || null,
      outro: sourcesData.outro || null,
      isFallback: sourcesData.isFallback || false,
    };

    await cacheService.set(cacheKey, result);
    return result;
  }
}

module.exports = new StreamingService();
