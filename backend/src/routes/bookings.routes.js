const express = require('express');
const {
    createBooking,
    getBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    getBookingExtras
} = require('../controllers/bookings.controller');

const { protect, restrictTo } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { bookingCreateSchema, bookingStatusSchema } = require('../utils/schemas/booking.schema');

const router = express.Router();

// Public routes
router.get('/extras', getBookingExtras);

// Combined routes for '/'
router.route('/')
    .get(protect, restrictTo('admin'), getBookings)
    .post(validate(bookingCreateSchema), createBooking);

// Protected routes (User or Admin)
router.get('/my', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.delete('/:id', protect, cancelBooking);

// Admin-only routes
router.patch('/:id/status', protect, restrictTo('admin'), validate(bookingStatusSchema), updateBookingStatus);

module.exports = router;
