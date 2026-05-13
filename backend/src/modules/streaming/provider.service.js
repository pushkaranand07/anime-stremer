const providerConfig = require('../../config/provider.config');
const ApiError = require('../../utils/ApiError');

class ProviderService {
  async withTimeout(promise, ms, label = '') {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms [${label}]`)), ms)
      ),
    ]);
  }

  async fetchAnimeInfo(query) {
    const errors = [];
    for (const { name, klass } of providerConfig.chain) {
      try {
        console.log(`[ProviderService] Searching ${name} for "${query}"...`);
        const provider = new klass();
        
        const searchResult = await this.withTimeout(
          provider.search(query), 
          providerConfig.timeoutMs, 
          `${name}/search`
        );
        
        if (!searchResult || !searchResult.results || !Array.isArray(searchResult.results) || searchResult.results.length === 0) {
           continue;
        }

        const bestMatch = searchResult.results[0];
        const info = await this.withTimeout(
          provider.fetchAnimeInfo(bestMatch.id), 
          providerConfig.timeoutMs, 
          `${name}/info`
        );
        
        if (!info || !info.episodes || !Array.isArray(info.episodes) || info.episodes.length === 0) {
           continue;
        }

        return {
          provider: name,
          ...info
        };
      } catch (err) {
        console.warn(`[ProviderService] ${name} failed: ${err.message}`);
        errors.push(`${name}: ${err.message}`);
      }
    }
    throw new ApiError(503, `All providers failed: ${errors.join(', ')}`);
  }

  async fetchEpisodeSources(episodeId, preferredProvider, subOrDub) {
    const orderedProviders = [
      providerConfig.chain.find(p => p.name === preferredProvider),
      ...providerConfig.chain.filter(p => p.name !== preferredProvider),
    ].filter(Boolean);

    const errors = [];
    for (const { name, klass } of orderedProviders) {
      try {
        const provider = new klass();
        const sourcesData = await this.withTimeout(
          provider.fetchEpisodeSources(episodeId, undefined, subOrDub),
          providerConfig.timeoutMs,
          `${name}/watch`
        );

        if (!sourcesData || !sourcesData.sources || !Array.isArray(sourcesData.sources) || sourcesData.sources.length === 0) {
           continue;
        }

        return {
          provider: name,
          ...sourcesData
        };
      } catch (err) {
        console.warn(`[ProviderService] ${name} watch failed: ${err.message}`);
        errors.push(`${name}: ${err.message}`);
      }
    }
    
    // Total failure fallback
    return this.getFallbackSources(preferredProvider, subOrDub);
  }

  getFallbackSources(provider, subOrDub) {
    return {
      provider: provider || 'Fallback',
      subOrDub,
      isFallback: true,
      sources: [
        {
          url: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
          quality: '1080p',
          isM3U8: false,
        }
      ],
      subtitles: [],
    };
  }
}

module.exports = new ProviderService();
