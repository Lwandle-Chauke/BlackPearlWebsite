// models/PendingImage.js
import mongoose from 'mongoose';

const PendingImageSchema = new mongoose.Schema({
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'GalleryAlbum', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  public_id: { type: String }, // Add this field for Cloudinary
  caption: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('PendingImage', PendingImageSchema);