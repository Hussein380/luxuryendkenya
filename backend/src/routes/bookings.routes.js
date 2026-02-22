const express = require('express');
const {
    createBooking,
    getBookings,
    getBookingById,
    getBookingStatus,
    updateBookingStatus,
    cancelBooking,
    getBookingExtras,
    handleMpesaCallback,
    confirmPayment,
    startTrip,
    checkIn,
    markAsOverdue,
    updatePenalty,
    payPenalty,
    markNoShow,
    extendTrip
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
router.get('/status/:bookingId', getBookingStatus);

// Protected routes (Admin or User's own)
router.get('/', protect, getBookings);
router.get('/my', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, restrictTo('admin'), validate(bookingStatusSchema), updateBookingStatus);
router.delete('/:id', protect, cancelBooking);

// Admin-only specialized actions
router.post('/:id/confirm-payment', protect, restrictTo('admin'), confirmPayment);
router.post('/:id/start-trip', protect, restrictTo('admin'), startTrip);
router.post('/:id/check-in', protect, restrictTo('admin'), checkIn);
router.post('/:id/mark-overdue', protect, restrictTo('admin'), markAsOverdue);
router.post('/:id/no-show', protect, restrictTo('admin'), markNoShow);
router.post('/:id/extend', protect, extendTrip);
router.patch('/:id/penalty', protect, restrictTo('admin'), updatePenalty);
router.post('/:id/pay-penalty', protect, restrictTo('admin'), payPenalty);

module.exports = router;
