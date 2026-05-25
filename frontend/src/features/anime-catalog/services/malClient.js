import axios from 'axios';

const BASE_URL = import.meta.env.VITE_MAL_API_URL || 'https://api.myanimelist.net/v2';
const CLIENT_ID = import.meta.env.VITE_MAL_CLIENT_ID;

const malApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

malApi.interceptors.request.use((config) => {
  if (CLIENT_ID) {
    config.headers['X-MAL-CLIENT-ID'] = CLIENT_ID;
  }
  return config;
});

export const hasMalClientId = Boolean(CLIENT_ID);
export const mal = {
  get: async (url, params) => {
    const response = await malApi.get(url, { params });
    return response.data;
  },
};
