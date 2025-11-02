// routes/galleryRequests.js
const express = require('express');
const router = express.Router();
const ImageUploadRequest = require('../models/ImageUploadRequest');
const GalleryAlbum = require('../models/GalleryAlbum');
const { protect, authorize } = require('../middleware/auth');

// POST /api/gallery/requests
// Body: { albumId, imageUrl, caption, requesterName, requesterEmail }
router.post('/', protect, async (req, res) => {
  try {
    const { albumId, imageUrl, caption, requesterName, requesterEmail } = req.body;
    if (!albumId || !requesterName || !requesterEmail) {
      return res.status(400).json({ message: 'albumId, requesterName and requesterEmail are required' });
    }

    // Make sure album exists
    const album = await GalleryAlbum.findById(albumId);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    const reqDoc = new GalleryRequest({
      albumId,
      imageUrl: imageUrl || null,
      caption: caption || '',
      requesterName,
      requesterEmail,
      status: 'pending'
    });

    await reqDoc.save();
    res.status(201).json({ message: 'Request submitted', request: reqDoc });
  } catch (err) {
    console.error('POST /api/gallery/requests', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/gallery/requests?status=pending
// Admin only
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const requests = await GalleryRequest.find(filter).sort({ createdAt: -1 }).lean();
    res.json(requests);
  } catch (err) {
    console.error('GET /api/gallery/requests', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/gallery/requests/:id/approve
// Admin approves a URL request: create an approved image in the album
router.post('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const request = await GalleryRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (!request.imageUrl) {
      return res.status(400).json({ message: 'Request has no imageUrl to approve' });
    }

    // Add image to album (approved)
    const album = await GalleryAlbum.findById(request.albumId);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    album.images.push({
      url: request.imageUrl,
      caption: request.caption || '',
      uploadedBy: request._id, // point to request id or leave null
      approved: true
    });

    await album.save();

    request.status = 'approved';
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    res.json({ message: 'Request approved and image added', album, request });
  } catch (err) {
    console.error('POST approve request', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/gallery/requests/:id/reject
router.post('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const { reason } = req.body;
    const request = await GalleryRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'rejected';
    request.rejectReason = reason || '';
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    res.json({ message: 'Request rejected', request });
  } catch (err) {
    console.error('POST reject request', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;