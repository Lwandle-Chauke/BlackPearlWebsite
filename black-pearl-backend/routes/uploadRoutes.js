import express from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.js';
import Image from '../models/Image.js'; // Import Image model

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const reviewStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/reviews/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/uploads/')); // Save to public/uploads
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, 'images-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const uploadReviewPhoto = multer({
    storage: reviewStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

const uploadGalleryImage = multer({
    storage: imageStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for gallery images
    },
    fileFilter: fileFilter
});

// Upload review photo
router.post('/review-photo', protect, uploadReviewPhoto.single('photo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        res.json({
            success: true,
            photoUrl: `/uploads/reviews/${req.file.filename}`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload gallery image
import { protect, authorize } from '../middleware/auth.js';

// Upload gallery image
router.post('/images', protect, authorize('admin'), uploadGalleryImage.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, msg: 'No image file uploaded.' });
        }

        // Assuming the image model expects a path relative to the public folder
        const imageUrl = `/uploads/${req.file.filename}`;

        // Here you would typically save the imageUrl and altText to your database
        const uploadedImage = {
            url: imageUrl,
            altText: req.body.altText || 'Gallery image',
            uploadedBy: req.user.id, // Assuming req.user is populated by protect middleware
            status: 'pending', // Default to pending
        };

        const image = await Image.create(uploadedImage);

        res.status(201).json({
            success: true,
            msg: 'Image uploaded successfully, awaiting approval.',
            image,
        });

    } catch (error) {
        console.error('Error during image upload:', error);
        // Check if the error is due to authorization
        if (error.message.includes('not authorized to access this route')) {
            return res.status(403).json({ success: false, msg: error.message });
        }
        res.status(500).json({ success: false, msg: error.message });
    }
});

export default router;
