// models/GalleryRequest.js
const mongoose = require('mongoose');

const GalleryRequestSchema = new mongoose.Schema({
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'GalleryAlbum', required: true },
  imageUrl: { type: String },                // optional if user uploads files
  caption: { type: String, default: '' },    // testimonial / caption
  requesterName: { type: String, required: true },
  requesterEmail: { type: String, required: true },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  processedAt: { type: Date, default: null },
  rejectReason: { type: String, default: '' }
});

module.exports = mongoose.model('GalleryRequest', GalleryRequestSchema);