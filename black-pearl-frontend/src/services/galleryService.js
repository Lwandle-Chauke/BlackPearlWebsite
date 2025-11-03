import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '[http://localhost:5000/api](http://localhost:5000/api)';
const api = axios.create({ baseURL: API_URL });

// Attach token automatically
api.interceptors.request.use(config => {
const token = localStorage.getItem('token');
if (token) config.headers.Authorization = `Bearer ${token}`;
return config;
});

const galleryService = {
// Approved albums
getAlbums: async () => (await api.get('/gallery')).data,
createAlbum: async (albumName) => (await api.post('/gallery', { albumName })).data,
updateAlbum: async (albumId, albumName) => (await api.put(`/gallery/${albumId}`, { albumName })).data,
deleteAlbum: async (albumId) => (await api.delete(`/gallery/${albumId}`)).data,

// Pending images
getPendingImages: async () => (await api.get('/gallery/pending/all')).data,
approveImage: async (albumId, pendingId) => (await api.post(`/gallery/${albumId}/images/${pendingId}/approve`)).data,
deletePendingImage: async (pendingId) => (await api.delete(`/gallery/pending/${pendingId}`)).data,

// Images
deleteImage: async (albumId, imageId) => (await api.delete(`/gallery/${albumId}/images/${imageId}`)).data,
updateImage: async (albumId, imageId, updates) => (await api.put(`/gallery/${albumId}/images/${imageId}`, updates)).data,

// Uploads
adminUpload: async (albumId, formData) => (await api.post(`/gallery/${albumId}/images`, formData)).data,
userUpload: async (albumId, formData) => (await api.post(`/gallery/${albumId}/images/user-upload`, formData)).data,
};

export default galleryService;
