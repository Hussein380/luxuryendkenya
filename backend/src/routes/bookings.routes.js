const express = require('express');
const {
    createBooking,
    getBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    getBookingExtras,
    handleMpesaCallback,
    confirmPayment
} = require('../controllers/bookings.controller');

const { protect, restrictTo, optionalAuth } = require('../middleware/auth.middleware');
const { uploadBookingDocuments } = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const parseFormData = require('../middleware/parseFormData.middleware');
const { bookingCreateSchema, bookingStatusSchema } = require('../utils/schemas/booking.schema');

const router = express.Router();

// Public routes (Optional Auth)
router.post('/',
    optionalAuth,
    uploadBookingDocuments,
    parseFormData(['extras']),
    validate(bookingCreateSchema),
    createBooking
);
router.post('/mpesa-callback', handleMpesaCallback);
router.get('/extras', getBookingExtras);

// Protected routes (Admin or User's own)
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, validate(bookingStatusSchema), updateBookingStatus);
router.post('/:id/confirm-payment', protect, restrictTo('admin'), confirmPayment);
router.delete('/:id', protect, cancelBooking);

// Protected routes (User or Admin)
router.get('/my', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.delete('/:id', protect, cancelBooking);

// Admin-only routes
router.patch('/:id/status', protect, restrictTo('admin'), validate(bookingStatusSchema), updateBookingStatus);

module.exports = router;
