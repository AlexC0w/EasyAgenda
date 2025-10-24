import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('agenda_octane_token');
      delete api.defaults.headers.common.Authorization;
    }
    return Promise.reject(error);
  }
);

export default api;
