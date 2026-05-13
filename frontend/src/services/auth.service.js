import apiClient from './api.client';

export const authService = {
  async signup(userData) {
    return await apiClient.post('/auth/signup', userData);
  },

  async login(credentials) {
    return await apiClient.post('/auth/login', credentials);
  },

  async refreshToken() {
    return await apiClient.post('/auth/refresh-token');
  },

  async getProfile() {
    return await apiClient.get('/users/me'); // To be implemented on backend
  }
};
