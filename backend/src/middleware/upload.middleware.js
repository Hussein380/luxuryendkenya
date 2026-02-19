const { upload } = require('../config/cloudinary.config');

/**
 * Middleware to handle car images upload
 * image: main cover image (single)
 * images: additional gallery images (multiple)
 */
exports.uploadCarImage = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);

/**
 * Middleware to handle booking document uploads (ID & License)
 */
exports.uploadBookingDocuments = upload.fields([
    { name: 'idImage', maxCount: 1 },
    { name: 'licenseImage', maxCount: 1 }
]);
