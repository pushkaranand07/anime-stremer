const { ANIME } = require('@consumet/extensions');

// Simple in-memory cache to prevent redundant scraping
const cache = {
  info: new Map(),
  watch: new Map(),
};

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

const PROVIDER_CHAIN = [
  { name: 'Hianime',     klass: ANIME.Hianime,     hasDub: true  },
  { name: 'AnimeKai',    klass: ANIME.AnimeKai,    hasDub: false },
  { name: 'AnimePahe',   klass: ANIME.AnimePahe,   hasDub: false },
  { name: 'KickAssAnime',klass: ANIME.KickAssAnime,hasDub: false },
];

const TIMEOUT_MS = 15000;

function withTimeout(promise, ms = TIMEOUT_MS, label = '') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms [${label}]`)), ms)
    ),
  ]);
}

class ConsumetService {
  async getAnimeInfo(query) {
    const cacheKey = query.toLowerCase().trim();
    const cached = cache.info.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return cached.data;
    }

    const errors = [];
    for (const { name, klass } of PROVIDER_CHAIN) {
      try {
        console.log(`[Consumet] Searching ${name} for "${query}"...`);
        const provider = new klass();
        
        const searchResult = await withTimeout(provider.search(query), 12000, `${name}/search`);
        if (!searchResult?.results?.length) continue;

        const bestMatch = searchResult.results[0];
        const info = await withTimeout(provider.fetchAnimeInfo(bestMatch.id), 12000, `${name}/info`);
        
        if (!info?.episodes?.length) continue;

        const result = {
          provider: name,
          id: info.id,
          title: info.title,
          image: info.image,
          description: info.description,
          hasDub: PROVIDER_CHAIN.find(p => p.name === name)?.hasDub || false,
          episodes: info.episodes.map(ep => ({
            id: ep.id,
            number: ep.number,
            title: ep.title || `Episode ${ep.number}`,
            isFiller: ep.isFiller || false,
          })),
        };

        cache.info.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      } catch (err) {
        errors.push(`${name}: ${err.message}`);
      }
    }
    throw new Error(`All providers failed: ${errors.join(', ')}`);
  }

  async getEpisodeSources(episodeId, preferredProvider = 'Hianime', subOrDub = 'sub') {
    const cacheKey = `${episodeId}-${preferredProvider}-${subOrDub}`;
    const cached = cache.watch.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return cached.data;
    }

    const orderedProviders = [
      PROVIDER_CHAIN.find(p => p.name === preferredProvider),
      ...PROVIDER_CHAIN.filter(p => p.name !== preferredProvider),
    ].filter(Boolean);

    const errors = [];
    for (const { name, klass } of orderedProviders) {
      try {
        const provider = new klass();
        const sourcesData = await withTimeout(
          provider.fetchEpisodeSources(episodeId, undefined, subOrDub),
          15000,
          `${name}/watch`
        );

        if (!sourcesData?.sources?.length) continue;

        const result = {
          provider: name,
          subOrDub,
          sources: sourcesData.sources,
          subtitles: sourcesData.subtitles || [],
          intro: sourcesData.intro || null,
          outro: sourcesData.outro || null,
        };

        cache.watch.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      } catch (err) {
        errors.push(`${name}: ${err.message}`);
      }
    }

    // Fallback logic if all live scrapers fail
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
        },
        {
          url: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
          quality: '720p',
          isM3U8: false,
        }
      ],
      subtitles: [],
      intro: { start: 0, end: 15 },
    };
  }
}

module.exports = new ConsumetService();
