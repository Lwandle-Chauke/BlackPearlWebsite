import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import GalleryAlbum from '../models/GalleryAlbum.js';
import PendingImage from '../models/PendingImage.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/gallery');
if (!fs.existsSync(uploadsDir)) {
fs.mkdirSync(uploadsDir, { recursive: true });
console.log('✅ Created uploads directory:', uploadsDir);
}

// Multer configuration
const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, uploadsDir),
filename: (req, file, cb) => {
const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
cb(null, uniqueName);
},
});

const upload = multer({
storage,
limits: { fileSize: 10 * 1024 * 1024 },
fileFilter: (req, file, cb) => {
if (file.mimetype.startsWith('image/')) cb(null, true);
else cb(new Error('Only image files are allowed!'), false);
},
});

// ✅ GET all albums
router.get('/', async (req, res) => {
try {
const albums = await GalleryAlbum.find().populate('images.uploadedBy', 'name email');
res.json(albums);
} catch (err) {
console.error('Get albums error:', err);
res.status(500).json({ message: 'Failed to fetch albums' });
}
});

// ✅ Create album
router.post('/', protect, authorize('admin'), async (req, res) => {
try {
const { albumName } = req.body;
const album = new GalleryAlbum({ albumName });
await album.save();
res.status(201).json(album);
} catch (err) {
console.error('Create album error:', err);
res.status(500).json({ message: 'Failed to create album' });
}
});

// ✅ Update album name
router.put('/:albumId', protect, authorize('admin'), async (req, res) => {
try {
const updated = await GalleryAlbum.findByIdAndUpdate(
req.params.albumId,
{ albumName: req.body.albumName },
{ new: true }
);
res.json(updated);
} catch (err) {
console.error('Rename album error:', err);
res.status(500).json({ message: 'Failed to rename album' });
}
});

// ✅ Delete album and all its images
router.delete('/:albumId', protect, authorize('admin'), async (req, res) => {
try {
const album = await GalleryAlbum.findById(req.params.albumId);
if (!album) return res.status(404).json({ message: 'Album not found' });

```
for (const image of album.images) {
  if (image.url?.startsWith('/uploads/gallery/')) {
    const filePath = path.join(uploadsDir, path.basename(image.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

await GalleryAlbum.findByIdAndDelete(req.params.albumId);
res.json({ message: 'Album deleted successfully' });
```

} catch (err) {
console.error('Delete album error:', err);
res.status(500).json({ message: 'Failed to delete album' });
}
});

// ✅ ADMIN Upload directly (approved)
router.post('/:albumId/images', protect, authorize('admin'), upload.array('images'), async (req, res) => {
try {
const album = await GalleryAlbum.findById(req.params.albumId);
if (!album) return res.status(404).json({ message: 'Album not found' });

```
const newImages = req.files.map(file => ({
  url: `/uploads/gallery/${file.filename}`,
  caption: req.body.caption || '',
  approved: true,
  uploadedBy: req.user._id,
}));

album.images.push(...newImages);
if (!album.cover && newImages.length > 0) album.cover = newImages[0].url;
await album.save();

res.json({ message: 'Images uploaded successfully', album });
```

} catch (err) {
console.error('Admin upload failed:', err);
res.status(500).json({ message: 'Upload failed', error: err.message });
}
});

// ✅ USER Upload to pending (no album.images push)
router.post('/:albumId/images/user-upload', protect, upload.array('images'), async (req, res) => {
try {
const album = await GalleryAlbum.findById(req.params.albumId);
if (!album) return res.status(404).json({ message: 'Album not found' });

```
const pendingImages = req.files.map(file => ({
  albumId: album._id,
  url: `/uploads/gallery/${file.filename}`,
  caption: req.body.caption || '',
  uploadedBy: req.user._id,
}));

await PendingImage.insertMany(pendingImages);
res.json({ message: 'Upload request submitted for approval' });
```

} catch (err) {
console.error('User upload failed:', err);
res.status(500).json({ message: 'Upload failed', error: err.message });
}
});

// ✅ ADMIN Get all pending
router.get('/pending/all', protect, authorize('admin'), async (req, res) => {
try {
const pending = await PendingImage.find()
.populate('albumId')
.populate('uploadedBy', 'name email');
res.json(pending);
} catch (err) {
console.error('Get pending images error:', err);
res.status(500).json({ message: 'Failed to fetch pending images' });
}
});

// ✅ ADMIN Approve pending image
router.post('/:albumId/images/:pendingId/approve', protect, authorize('admin'), async (req, res) => {
try {
const pending = await PendingImage.findById(req.params.pendingId);
if (!pending) return res.status(404).json({ message: 'Pending image not found' });

```
const album = await GalleryAlbum.findById(pending.albumId);
if (!album) return res.status(404).json({ message: 'Album not found' });

album.images.push({
  url: pending.url,
  caption: pending.caption,
  approved: true,
  uploadedBy: pending.uploadedBy,
});

if (!album.cover) album.cover = pending.url;
await album.save();
await PendingImage.findByIdAndDelete(pending._id);

res.json({ message: 'Image approved successfully', album });
```

} catch (err) {
console.error('Approve pending image error:', err);
res.status(500).json({ message: 'Failed to approve image', error: err.message });
}
});

// ✅ ADMIN Delete image (approved or pending)
router.delete('/:albumId/images/:imageId', protect, authorize('admin'), async (req, res) => {
try {
// Check pending first
let pending = await PendingImage.findById(req.params.imageId);
if (pending) {
const filePath = path.join(uploadsDir, path.basename(pending.url));
if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
await PendingImage.findByIdAndDelete(req.params.imageId);
return res.json({ message: 'Pending image deleted successfully' });
}

```
// Then check approved in album
const album = await GalleryAlbum.findById(req.params.albumId);
if (!album) return res.status(404).json({ message: 'Album not found' });

const imageToDelete = album.images.id(req.params.imageId);
if (!imageToDelete) return res.status(404).json({ message: 'Image not found' });

const filePath = path.join(uploadsDir, path.basename(imageToDelete.url));
if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

album.images.pull(req.params.imageId);
if (album.cover === imageToDelete.url) album.cover = album.images[0]?.url || null;
await album.save();

res.json({ message: 'Image deleted successfully' });
```

} catch (err) {
console.error('Delete image error:', err);
res.status(500).json({ message: 'Server error while deleting image', error: err.message });
}
});

export default router;
