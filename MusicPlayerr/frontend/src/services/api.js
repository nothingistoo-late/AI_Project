import axios from 'axios';

// Use proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:51815');

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token and handle FormData
apiClient.interceptors.request.use(
  (config) => {
    // If data is FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  register: (userData) => apiClient.post('/api/auth/register', userData),
};

// Tracks API
export const tracksAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.genre) queryParams.append('genre', params.genre);
    if (params.albumId) queryParams.append('albumId', params.albumId);
    return apiClient.get(`/api/tracks?${queryParams.toString()}`);
  },
  getById: (id) => apiClient.get(`/api/tracks/${id}`),
  upload: (formData) => {
    // Don't set Content-Type header, let browser set it with boundary
    return apiClient.post('/api/tracks', formData);
  },
  update: (id, formData) => {
    // If formData is FormData, don't set Content-Type header (let browser set it with boundary)
    if (formData instanceof FormData) {
      return apiClient.put(`/api/tracks/${id}`, formData);
    }
    return apiClient.put(`/api/tracks/${id}`, formData);
  },
  delete: (id) => apiClient.delete(`/api/tracks/${id}`),
  recordPlayback: (id) => apiClient.post(`/api/tracks/${id}/play`),
};

// Albums API
export const albumsAPI = {
  getAll: (search = '') => {
    const queryParams = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get(`/api/albums${queryParams}`);
  },
  getById: (id) => apiClient.get(`/api/albums/${id}`),
  create: (formData) => {
    // Don't set Content-Type header, let browser set it with boundary
    return apiClient.post('/api/albums', formData);
  },
  update: (id, formData) => {
    // If formData is FormData, don't set Content-Type header (let browser set it with boundary)
    if (formData instanceof FormData) {
      return apiClient.put(`/api/albums/${id}`, formData);
    }
    return apiClient.put(`/api/albums/${id}`, formData);
  },
  delete: (id) => apiClient.delete(`/api/albums/${id}`),
  addTrack: (albumId, trackId) => apiClient.post(`/api/albums/${albumId}/tracks/${trackId}`),
  removeTrack: (albumId, trackId) => apiClient.delete(`/api/albums/${albumId}/tracks/${trackId}`),
};

// Playlists API
export const playlistsAPI = {
  getAll: () => apiClient.get('/api/playlists'),
  getById: (id) => apiClient.get(`/api/playlists/${id}`),
  create: (playlist) => apiClient.post('/api/playlists', playlist),
  update: (id, playlist) => apiClient.put(`/api/playlists/${id}`, playlist),
  delete: (id) => apiClient.delete(`/api/playlists/${id}`),
  addTrack: (playlistId, trackId) => apiClient.post(`/api/playlists/${playlistId}/tracks/${trackId}`),
  removeTrack: (playlistId, trackId) => apiClient.delete(`/api/playlists/${playlistId}/tracks/${trackId}`),
};

// History API
export const historyAPI = {
  getHistory: (limit = 50) => apiClient.get(`/api/history?limit=${limit}`),
  getRecent: (limit = 20) => apiClient.get(`/api/history/recent?limit=${limit}`),
};

// Search API
export const searchAPI = {
  search: (query) => apiClient.get(`/api/search?q=${encodeURIComponent(query)}`),
  getGenres: () => apiClient.get('/api/search/genres'),
};

// Stream API
export const streamAPI = {
  getAudioUrl: (id) => {
    // Use proxy in dev, direct URL in production
    const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:51815');
    // Return URL without token - token will be sent in Authorization header via fetch
    return `${baseUrl}/api/stream/audio/${id}`;
  },
  getWaveform: (id, samples = 200) => apiClient.get(`/api/stream/waveform/${id}?samples=${samples}`),
};

// Analytics API
export const analyticsAPI = {
  getTopTracks: (limit = 10) => apiClient.get(`/api/analytics/top-tracks?limit=${limit}`),
  getTopAlbums: (limit = 10) => apiClient.get(`/api/analytics/top-albums?limit=${limit}`),
  getRecentUploads: (limit = 10) => apiClient.get(`/api/analytics/recent-uploads?limit=${limit}`),
  getUserStats: () => apiClient.get('/api/analytics/user-stats'),
};

// Helper function to get full URL for images
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If starts with /, it's a relative path from backend
  if (imagePath.startsWith('/')) {
    // Remove leading slash and use /api/images endpoint for public access
    const cleanPath = imagePath.startsWith('/uploads/') ? imagePath.substring(1) : imagePath;
    
    // In dev mode, use proxy if VITE_API_URL is empty
    const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:51815');
    
    // Use /api/images endpoint for better control
    if (!baseUrl) {
      // Dev mode with proxy
      return `/api/images/${cleanPath}`;
    }
    return `${baseUrl}/api/images/${cleanPath}`;
  }
  
  // Otherwise, assume it's a relative path
  return imagePath;
};

