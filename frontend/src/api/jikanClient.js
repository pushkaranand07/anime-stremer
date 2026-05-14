import axios from 'axios';

const jikanClient = axios.create({
  baseURL: import.meta.env.VITE_JIKAN_API_URL || 'https://api.jikan.moe/v4',
  timeout: 10000,
});

// Request interceptor: add a small delay to respect rate limits
let lastRequestTime = 0;
jikanClient.interceptors.request.use(async (config) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 400) { // 400ms between requests ≈ 2.5 req/sec
    await new Promise(resolve => setTimeout(resolve, 400 - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
  return config;
});

// Response interceptor: handle common errors and retry on 429
jikanClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 429) {
      console.warn('Jikan Rate limit hit. Retrying...');
      const retryAfterHeader = error.response.headers['retry-after'];
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 1;
      
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      // Retry the original request
      return jikanClient(error.config);
    }
    return Promise.reject(error);
  }
);

export default jikanClient;
