import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Shared Axios instance — session-cookie edition.
 */
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

// ─── Request interceptor: attach CSRF token ───────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (config.method && mutatingMethods.includes(config.method.toUpperCase())) {
      const csrfToken = getCookie('csrftoken');
      if (csrfToken && config.headers) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: unwrap data, handle auth errors ──────────────────
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    // Extract server-provided descriptive error message
    const serverMessage =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.response?.data?.message;

    if (serverMessage && typeof serverMessage === 'string') {
      error.message = serverMessage;
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      if (!error.config?.url?.includes('/auth/login/')) {
        useAuthStore.getState().clearAuth();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

// ─── CSRF bootstrap ─────────────────────────────────────────────────────────
export async function bootstrapCsrf(): Promise<void> {
  try {
    await axios.get(`${API_URL}/auth/csrf/`, { withCredentials: true });
  } catch {
    // Non-fatal; the CSRF cookie may already exist
  }
}
