const cloudinary = require('../config/cloudinary');

// @desc    Upload image to Cloudinary
// @route   POST /api/upload/image
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'bro-fusion/products',
      transformation: [{ width: 800, height: 1000, crop: 'fill', quality: 'auto' }],
    });

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image/:publicId
exports.deleteImage = async (req, res, next) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    await cloudinary.uploader.destroy(publicId);
    res.status(200).json({ success: true, message: 'Image deleted' });
  } catch (err) {
    next(err);
  }
};
