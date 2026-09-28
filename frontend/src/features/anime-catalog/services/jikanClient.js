import axios from 'axios';
import { getFallbackForJikan } from './animeFallbackService';

const BASE_URL = import.meta.env.VITE_JIKAN_API_URL || import.meta.env.VITE_JIKAN_BASE_URL || 'https://api.jikan.moe/v4';

// ── Rate-limit queue ──────────────────────────────────────────────────────────
// All requests share this single lastCallTime stamp to adhere to Jikan's limits.
const INTERVAL_MS = 350;
let lastCallTime = 0;

// In-memory success cache to avoid spamming the upstream API
const responseCache = new Map();

async function throttledGet(url, params = {}) {
  const cacheKey = `${url}?${new URLSearchParams(params).toString()}`;
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  const now = Date.now();
  const wait = Math.max(0, INTERVAL_MS - (now - lastCallTime));
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCallTime = Date.now();

  try {
    const res = await axios.get(`${BASE_URL}${url}`, {
      params,
      timeout: 4500 // 4.5s timeout prevents long hangs when upstream MAL is down
    });

    if (res.data && (Array.isArray(res.data.data) || typeof res.data.data === 'object')) {
      responseCache.set(cacheKey, res.data);
      return res.data;
    }
    throw new Error('Invalid Jikan response payload');
  } catch (err) {
    const status = err.response?.status;

    // Retry once on rate-limit 429
    if (status === 429) {
      console.warn('[Jikan] Rate limit 429 hit — retrying in 1.5s...');
      await new Promise(r => setTimeout(r, 1500));
      lastCallTime = Date.now();
      try {
        const retryRes = await axios.get(`${BASE_URL}${url}`, { params, timeout: 5000 });
        if (retryRes.data) {
          responseCache.set(cacheKey, retryRes.data);
          return retryRes.data;
        }
      } catch (retryErr) {
        console.warn('[Jikan] Retry also failed, routing to fallback service...');
      }
    } else {
      console.warn(`[Jikan] ${url} failed with status ${status || err.code || 'TIMEOUT'}. Routing to live fallback...`);
    }

    // Seamlessly provide live fallback (AniList / Kitsu / Curated) instead of crashing with 504
    try {
      const fallbackData = await getFallbackForJikan(url, params);
      responseCache.set(cacheKey, fallbackData);
      return fallbackData;
    } catch (fallbackErr) {
      console.error('[Jikan] Fallback provider failed:', fallbackErr);
      throw err;
    }
  }
}

// Named export used by unified hooks
export const jikan = { get: throttledGet };

// Default export kept for legacy import sites
export default { get: throttledGet };
