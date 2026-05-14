const { ANIME } = require('@consumet/extensions');

const providerConfig = Object.freeze({
  chain: [
    { name: 'AnimePahe',   klass: ANIME.AnimePahe,   hasDub: false },
    { name: 'Hianime',     klass: ANIME.Hianime,     hasDub: true  },
    { name: 'AnimeKai',    klass: ANIME.AnimeKai,    hasDub: false },
    { name: 'KickAssAnime',klass: ANIME.KickAssAnime,hasDub: false },
  ],
  timeoutMs: parseInt(process.env.PROVIDER_TIMEOUT_MS) || 20000,
  retryCount: parseInt(process.env.PROVIDER_RETRY_COUNT) || 3,
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS) || 1800, // 30 mins
});

module.exports = providerConfig;
