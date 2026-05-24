import axios from 'axios';

const BASE_URL = import.meta.env.VITE_JIKAN_API_URL || 'https://api.jikan.moe/v4';

// ── Rate-limit queue ──────────────────────────────────────────────────────────
// All requests — regardless of which hook fires them — share this single
// lastCallTime stamp. This means concurrent React Query mounts cannot
// simultaneously fire requests; each one waits its turn.
const INTERVAL_MS = 400; // ~2.5 req/s, safely under Jikan's 3/s hard limit
let lastCallTime = 0;

async function throttledGet(url, params) {
  const now = Date.now();
  const wait = Math.max(0, INTERVAL_MS - (now - lastCallTime));
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCallTime = Date.now();

  try {
    const res = await axios.get(`${BASE_URL}${url}`, { params });
    return res.data;
  } catch (err) {
    if (err.response?.status === 429) {
      console.warn('[Jikan] Rate limit hit — waiting 2s before retry...');
      await new Promise(r => setTimeout(r, 2000));
      lastCallTime = Date.now();
      const retry = await axios.get(`${BASE_URL}${url}`, { params });
      return retry.data;
    }
    throw err;
  }
}

// Named export used by the new unified hook
export const jikan = { get: throttledGet };

// Default export kept for any legacy import sites
export default { get: throttledGet };
