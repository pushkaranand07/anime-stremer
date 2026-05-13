import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Helper: always gets a fresh auth header from localStorage
const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchFavorites = async () => {
  const response = await axios.get(`${API_BASE}/favorites`, {
    headers: authHeader(),
  });
  return response.data;
};

export const addFavoriteToDB = async (anime) => {
  const payload = {
    anime_id: anime.mal_id,
    title: anime.title,
    image_url: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
    score: anime.score,
    episodes: anime.episodes,
  };
  const response = await axios.post(`${API_BASE}/favorites`, payload, {
    headers: authHeader(),
  });
  return response.data;
};

export const removeFavoriteFromDB = async (animeId) => {
  const response = await axios.delete(`${API_BASE}/favorites/${animeId}`, {
    headers: authHeader(),
  });
  return response.data;
};
