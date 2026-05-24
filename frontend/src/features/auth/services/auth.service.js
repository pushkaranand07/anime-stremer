import apiClient from '../../../services/api.client';

export const authService = {
  async signup(userData) {
    return await apiClient.post('/auth/signup', userData);
  },

  async login(credentials) {
    return await apiClient.post('/auth/login', credentials);
  },

  async refreshToken(refreshToken) {
    return await apiClient.post('/auth/refresh-token', { refreshToken });
  },

  async logout(refreshToken) {
    return await apiClient.post('/auth/logout', { refreshToken });
  },
};
