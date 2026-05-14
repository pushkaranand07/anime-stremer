const providerConfig = require('../../config/provider.config');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');


class ProviderService {
  async withTimeout(promise, ms, label = '') {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms [${label}]`)), ms)
      ),
    ]);
  }

  /**
   * Fetch anime info by searching all providers in PARALLEL.
   * Promise.any resolves with the FIRST success — reduces worst-case
   * latency from N×timeout (sequential) to 1×timeout (parallel).
   */
  async fetchAnimeInfo(query) {
    const attempts = providerConfig.chain
      .filter(({ klass }) => !!klass)
      .map(async ({ name, klass }) => {
        logger.info(`[ProviderService] Searching ${name} for "${query}"...`);
        const provider = new klass();

        const searchResult = await this.withTimeout(
          provider.search(query),
          providerConfig.timeoutMs,
          `${name}/search`
        );

        if (!searchResult?.results?.length) {
          throw new Error(`${name}: no results`);
        }

        logger.info(`[ProviderService] ${name} found ${searchResult.results.length} results. Top 3: ${searchResult.results.slice(0, 3).map(r => r.title).join(', ')}`);

        // Strategy: Find best title match
        const normalizedQuery = query.toLowerCase().trim();
        const bestMatch = searchResult.results.find(r =>
          r.title.toLowerCase() === normalizedQuery ||
          r.title.toLowerCase() === `${normalizedQuery} (tv)` ||
          r.title.toLowerCase().startsWith(normalizedQuery)
        ) || searchResult.results[0];

        logger.info(`[ProviderService] ${name} best match: "${bestMatch.title}" (${bestMatch.id})`);

        const info = await this.withTimeout(
          provider.fetchAnimeInfo(bestMatch.id),
          providerConfig.timeoutMs,
          `${name}/info`
        );

        if (!info?.episodes?.length) {
          throw new Error(`${name}: no episodes`);
        }

        logger.info(`[ProviderService] ${name} succeeded for "${query}" — ${info.episodes.length} episodes`);
        return { provider: name, ...info };
      });

    try {
      return await Promise.any(attempts);
    } catch (aggregateError) {
      // AggregateError: all providers failed
      const messages = aggregateError.errors?.map(e => e.message).join('; ') || 'All providers failed';
      throw new ApiError(503, `No streaming sources found: ${messages}`);
    }
  }

  /**
   * Fetch episode sources — uses the preferred provider first (the one that
   * issued the episode ID), then falls back to others.
   */
  async fetchEpisodeSources(episodeId, preferredProvider, subOrDub) {
    const orderedProviders = [
      providerConfig.chain.find(p => p.name === preferredProvider),
      ...providerConfig.chain.filter(p => p.name !== preferredProvider),
    ].filter(Boolean);

    const errors = [];
    for (const { name, klass } of orderedProviders) {
      try {
        if (!klass) {
          logger.warn(`[ProviderService] Skipping ${name}: Provider class is not defined.`);
          continue;
        }
        const provider = new klass();
        const sourcesData = await this.withTimeout(
          provider.fetchEpisodeSources(episodeId, undefined, subOrDub),
          providerConfig.timeoutMs,
          `${name}/watch`
        );

        if (!sourcesData?.sources?.length) {
           continue;
        }

        return {
          provider: name,
          ...sourcesData
        };
      } catch (err) {
        logger.error(`[ProviderService] ${name} watch failed: ${err.message}`, { stack: err.stack });
        errors.push(`${name}: ${err.message}`);
      }
    }

    // All providers failed — throw so the frontend shows "No Streams Available"
    throw new ApiError(503, `No streaming sources available. All providers failed: ${errors.join(', ')}`);
  }
}

module.exports = new ProviderService();
