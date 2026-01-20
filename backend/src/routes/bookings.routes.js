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

const router = express.Router();

// Public routes
router.post('/', createBooking); // Public creation for guest checkout or authenticated users
router.get('/extras', getBookingExtras);

// Protected routes (User or Admin)
router.use(protect);

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.delete('/:id', cancelBooking);

// Admin-only routes
router.patch('/:id/status', restrictTo('admin'), updateBookingStatus);

module.exports = router;
