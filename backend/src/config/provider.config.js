const { ANIME } = require('@consumet/extensions');

const providerConfig = Object.freeze({
  chain: [
    { name: 'Hianime',     klass: ANIME.Hianime,     hasDub: true  },
    { name: 'AnimeKai',    klass: ANIME.AnimeKai,    hasDub: false },
    { name: 'AnimePahe',   klass: ANIME.AnimePahe,   hasDub: false },
    { name: 'KickAssAnime',klass: ANIME.KickAssAnime,hasDub: false },
  ],
  timeoutMs: parseInt(process.env.PROVIDER_TIMEOUT_MS) || 15000,
  retryCount: parseInt(process.env.PROVIDER_RETRY_COUNT) || 3,
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS) || 1800, // 30 mins
});

module.exports = providerConfig;
