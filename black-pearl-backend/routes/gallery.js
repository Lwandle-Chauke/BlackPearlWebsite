// routes/gallery.js
import express from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import GalleryAlbum from '../models/GalleryAlbum.js';
import PendingImage from '../models/PendingImage.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'black-pearl-gallery',
    format: async (req, file) => {
      // Determine format based on file mimetype
      if (file.mimetype === 'image/png') return 'png';
      if (file.mimetype === 'image/webp') return 'webp';
      if (file.mimetype === 'image/gif') return 'gif';
      return 'jpg';
    },
    public_id: (req, file) => {
      return `bp-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    },
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
    ]
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// 🧭 GET all albums
router.get('/', async (req, res) => {
  try {
    const albums = await GalleryAlbum.find().populate('images.uploadedBy', 'name email');
    res.json(albums);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch albums', error: err.message });
  }
});

// 🧭 POST create new album
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { albumName } = req.body;
    const album = new GalleryAlbum({ albumName });
    await album.save();
    res.status(201).json(album);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create album', error: err.message });
  }
});

// 🧭 PUT rename album
router.put('/:albumId', protect, authorize('admin'), async (req, res) => {
  try {
    const { albumName } = req.body;
    const updated = await GalleryAlbum.findByIdAndUpdate(
      req.params.albumId, 
      { albumName }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to rename album', error: err.message });
  }
});

// 🧭 DELETE album
router.delete('/:albumId', protect, authorize('admin'), async (req, res) => {
  try {
    const album = await GalleryAlbum.findById(req.params.albumId);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    // Delete images from Cloudinary
    for (const image of album.images) {
      if (image.public_id) {
        try {
          await cloudinary.v2.uploader.destroy(image.public_id);
        } catch (cloudinaryErr) {
          console.warn(`Failed to delete image from Cloudinary: ${image.public_id}`, cloudinaryErr);
        }
      }
    }

    await GalleryAlbum.findByIdAndDelete(req.params.albumId);
    res.json({ message: 'Album deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete album', error: err.message });
  }
});

// ✅ ADMIN — Upload directly to approved images (Updated for Cloudinary)
router.post('/:albumId/images', protect, authorize('admin'), upload.array('images'), async (req, res) => {
  try {
    const album = await GalleryAlbum.findById(req.params.albumId);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    const newImages = req.files.map(file => ({
      url: file.path, // Cloudinary URL
      public_id: file.filename, // Cloudinary public_id for deletion
      caption: req.body.caption || '',
      approved: true,
      uploadedBy: req.user._id,
    }));

    album.images.push(...newImages);

    // set album cover if missing
    if (!album.cover && newImages.length > 0) {
      album.cover = newImages[0].url;
    }

    await album.save();
    
    // Populate the uploadedBy field for the response
    await album.populate('images.uploadedBy', 'name email');
    
    res.json({ 
      message: 'Images uploaded successfully', 
      images: newImages,
      album 
    });
  } catch (err) {
    console.error('Admin upload failed:', err);
    
    // Clean up uploaded files if there was an error
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await cloudinary.v2.uploader.destroy(file.filename);
        } catch (cleanupErr) {
          console.error('Failed to cleanup uploaded file:', cleanupErr);
        }
      }
    }
    
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// ✅ USER — Upload to pending queue (Updated for Cloudinary)
router.post('/:albumId/images/user-upload', protect, upload.array('images'), async (req, res) => {
  try {
    const album = await GalleryAlbum.findById(req.params.albumId);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    const pendingImages = req.files.map(file => ({
      albumId: album._id,
      url: file.path, // Cloudinary URL
      public_id: file.filename, // Cloudinary public_id
      caption: req.body.caption || '',
      uploadedBy: req.user._id,
    }));

    await PendingImage.insertMany(pendingImages);
    res.json({ message: 'Upload request submitted for approval' });
  } catch (err) {
    console.error('User upload failed:', err);
    
    // Clean up uploaded files if there was an error
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await cloudinary.v2.uploader.destroy(file.filename);
        } catch (cleanupErr) {
          console.error('Failed to cleanup uploaded file:', cleanupErr);
        }
      }
    }
    
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// ✅ ADMIN — Get all pending
router.get('/pending/all', protect, authorize('admin'), async (req, res) => {
  try {
    const pending = await PendingImage.find()
      .populate('albumId')
      .populate('uploadedBy', 'name email');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending images', error: err.message });
  }
});

// ✅ ADMIN — Approve pending image
router.post('/:albumId/images/:pendingId/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const pending = await PendingImage.findById(req.params.pendingId);
    if (!pending) return res.status(404).json({ message: 'Pending image not found' });

    const album = await GalleryAlbum.findById(pending.albumId);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    album.images.push({
      url: pending.url,
      public_id: pending.public_id,
      caption: pending.caption,
      approved: true,
      uploadedBy: pending.uploadedBy,
    });

    if (!album.cover) album.cover = pending.url;

    await album.save();
    await PendingImage.findByIdAndDelete(pending._id);

    res.json({ message: 'Image approved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Approval failed', error: err.message });
  }
});

// ✅ ADMIN — Delete pending image
router.delete('/:albumId/images/:pendingId', protect, authorize('admin'), async (req, res) => {
  try {
    const pending = await PendingImage.findById(req.params.pendingId);
    if (!pending) return res.status(404).json({ message: 'Pending image not found' });

    // Delete from Cloudinary
    if (pending.public_id) {
      try {
        await cloudinary.v2.uploader.destroy(pending.public_id);
      } catch (cloudinaryErr) {
        console.warn(`Failed to delete pending image from Cloudinary: ${pending.public_id}`, cloudinaryErr);
      }
    }

    await PendingImage.findByIdAndDelete(pending._id);
    res.json({ message: 'Pending image deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete pending image', error: err.message });
  }
});

// 🧭 DELETE image from album - UPDATED for Cloudinary
router.delete('/:albumId/images/:imageId', protect, authorize('admin'), async (req, res) => {
  try {
    const album = await GalleryAlbum.findById(req.params.albumId);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    // Find the image to get its Cloudinary public_id
    const imageToDelete = album.images.id(req.params.imageId);
    if (!imageToDelete) return res.status(404).json({ message: 'Image not found' });

    // Delete from Cloudinary if public_id exists
    if (imageToDelete.public_id) {
      try {
        await cloudinary.v2.uploader.destroy(imageToDelete.public_id);
      } catch (cloudinaryErr) {
        console.warn(`Failed to delete image from Cloudinary: ${imageToDelete.public_id}`, cloudinaryErr);
      }
    }

    // Remove image from album
    album.images.pull(req.params.imageId);

    // If deleted image was the cover, set a new cover
    if (album.cover === imageToDelete.url && album.images.length > 0) {
      album.cover = album.images[0].url;
    } else if (album.images.length === 0) {
      album.cover = null;
    }

    await album.save();

    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Delete image failed:', err);
    res.status(500).json({ message: 'Failed to delete image', error: err.message });
  }
});

// 🧭 UPDATE image caption
router.put('/:albumId/images/:imageId', protect, authorize('admin'), async (req, res) => {
  try {
    const album = await GalleryAlbum.findById(req.params.albumId);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    const image = album.images.id(req.params.imageId);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    const { caption } = req.body;
    image.caption = caption || '';

    await album.save();
    res.json({ message: 'Image caption updated successfully', image });
  } catch (err) {
    console.error('Update image caption failed:', err);
    res.status(500).json({ message: 'Failed to update image caption', error: err.message });
  }
});

export default router;