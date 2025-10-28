import express from 'express';
import multer from 'multer';
import path from 'path';
import Image from '../models/Image.js';
import { protect, authorize } from '../middleware/auth.js'; // Assuming auth middleware exists
import { fileURLToPath } from 'url';
import fs from 'fs'; // Import file system module

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: './public/uploads/', // Store uploads in a public directory
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
}).array('images', 10); // 'images' is the field name, allow up to 10 files

// Check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif|webp|avif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// @desc    Upload images
// @route   POST /api/images/upload
// @access  Private (User)
router.post('/upload', protect, async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            res.status(400).json({ msg: err });
        } else {
            if (req.files == undefined) {
                res.status(400).json({ msg: 'No file selected' });
            } else {
                try {
                    const uploadedImages = req.files.map(file => ({
                        url: `/uploads/${file.filename}`,
                        altText: req.body.altText || 'Gallery image',
                        uploadedBy: req.user.id,
                        status: 'pending', // Default to pending
                    }));

                    const images = await Image.insertMany(uploadedImages);
                    res.status(201).json({
                        msg: 'Images uploaded successfully and awaiting admin approval',
                        images,
                    });
                } catch (error) {
                    console.error(error);
                    res.status(500).send('Server error');
                }
            }
        }
    });
});

// @desc    Get all approved images (for public gallery)
// @route   GET /api/images/approved
// @access  Public
router.get('/approved', async (req, res) => {
    try {
        const images = await Image.find({ status: 'approved' }).populate('uploadedBy', 'name');
        res.json(images);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// @desc    Get pending images (for admin approval)
// @route   GET /api/images/pending
// @access  Private (Admin)
router.get('/pending', protect, authorize('admin'), async (req, res) => {
    try {
        const images = await Image.find({ status: 'pending' }).populate('uploadedBy', 'name');
        res.json(images);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// @desc    Update image status (approve/decline)
// @route   PUT /api/images/:id/status
// @access  Private (Admin)
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).json({ msg: 'Image not found' });
        }

        image.status = req.body.status; // 'approved' or 'declined'
        await image.save();

        res.json({ msg: `Image status updated to ${image.status}`, image });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// @desc    Delete an image
// @route   DELETE /api/images/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).json({ msg: 'Image not found' });
        }

        // Delete image file from the server
        const imagePath = path.join(__dirname, '../public', image.url);
        fs.unlink(imagePath, async (err) => {
            if (err) {
                console.error(`Error deleting image file: ${err}`);
                // Even if file deletion fails, try to remove from DB
            }
            await image.deleteOne();
            res.json({ msg: 'Image removed' });
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

export default router;
