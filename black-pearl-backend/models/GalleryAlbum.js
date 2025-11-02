// models/GalleryAlbum.js
import mongoose from 'mongoose';

const GalleryAlbumSchema = new mongoose.Schema({
  albumName: { type: String, required: true },
  cover: { type: String, default: '' },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String }, // Add this field for Cloudinary
      caption: { type: String, default: '' },
      approved: { type: Boolean, default: true },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model('GalleryAlbum', GalleryAlbumSchema);