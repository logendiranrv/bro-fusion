// @desc    Upload image
// @route   POST /api/upload/image
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    res.status(200).json({
      success: true,
      url: dataURI,
      publicId: '',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete image
// @route   DELETE /api/upload/image/:publicId
exports.deleteImage = async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Image deleted' });
};
