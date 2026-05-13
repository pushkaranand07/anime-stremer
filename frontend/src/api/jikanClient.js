import axios from 'axios';

const jikanClient = axios.create({
  baseURL: 'https://api.jikan.moe/v4',
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

// Response interceptor: handle common errors
jikanClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      console.warn('Rate limit hit. Implement retry logic here.');
    }
    return Promise.reject(error);
  }
);

export default jikanClient;
