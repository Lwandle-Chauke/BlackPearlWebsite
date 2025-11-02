// src/services/galleryService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests automatically
api.interceptors.request.use(
  (config) => {
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

const galleryService = {
  // Get all albums (public - no auth needed)
  getAlbums: async () => {
    try {
      console.log('Fetching albums from:', `${API_URL}/gallery`);
      const response = await api.get('/gallery');
      console.log('Albums response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching albums:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch albums');
    }
  },

  // Create new album (admin only)
  createAlbum: async (albumName) => {
    const response = await api.post('/gallery', { albumName });
    return response.data;
  },

  // Update album name (admin only)
  updateAlbum: async (albumId, albumName) => {
    const response = await api.put(`/gallery/${albumId}`, { albumName });
    return response.data;
  },

  // Delete album (admin only)
  deleteAlbum: async (albumId) => {
    const response = await api.delete(`/gallery/${albumId}`);
    return response.data;
  },

  // Get pending images (admin only)
  getPendingImages: async () => {
    const response = await api.get('/gallery/pending/all');
    return response.data;
  },

  // Approve pending image (admin only)
  approveImage: async (albumId, pendingId) => {
    const response = await api.post(`/gallery/${albumId}/images/${pendingId}/approve`);
    return response.data;
  },

  // Delete image from album (admin only)
  deleteImage: async (albumId, imageId) => {
    const response = await api.delete(`/gallery/${albumId}/images/${imageId}`);
    return response.data;
  },

  // Update image caption (admin only)
  updateImage: async (albumId, imageId, updates) => {
    const response = await api.put(`/gallery/${albumId}/images/${imageId}`, updates);
    return response.data;
  },

  // User upload to pending (regular users)
  userUpload: async (albumId, formData) => {
    const response = await api.post(`/gallery/${albumId}/images/user-upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default galleryService;