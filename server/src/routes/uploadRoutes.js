const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin only upload routes
router.post('/image', protect, admin, upload.single('image'), uploadImage);
router.delete('/image/:publicId', protect, admin, deleteImage);

module.exports = router;
