const { upload } = require('../config/cloudinary.config');

/**
 * Middleware to handle single image upload for cars
 * Expects the file to be in the 'image' field of the request
 */
exports.uploadCarImage = upload.single('image');
