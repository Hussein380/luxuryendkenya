const Booking = require('../models/Booking');
const BookingExtra = require('../models/BookingExtra');
const bookingService = require('../services/booking.service');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public (Optional Auth)
exports.createBooking = async (req, res) => {
    try {
        const {
            carId,
            customerName,
            customerEmail,
            customerPhone,
            pickupDate,
            returnDate,
            pickupLocation,
            returnLocation,
            extras
        } = req.body;

        // 1. Check Availability
        const isAvailable = await bookingService.checkCarAvailability(carId, new Date(pickupDate), new Date(returnDate));
        if (!isAvailable) {
            return sendError(res, 'Car is not available for the selected dates', 400);
        }

        // 2. Calculate Pricing
        const { totalDays, totalPrice } = await bookingService.calculateTotalPrice(
            carId,
            new Date(pickupDate),
            new Date(returnDate),
            extras
        );

        // 3. Create Booking
        const booking = await Booking.create({
            bookingId: bookingService.generateBookingId(),
            car: carId,
            user: req.user ? req.user._id : null,
            customerName,
            customerEmail,
            customerPhone,
            pickupDate,
            returnDate,
            pickupLocation,
            returnLocation,
            extras,
            totalDays,
            totalPrice
        });

        sendSuccess(res, booking, 'Booking created successfully', 201);
    } catch (error) {
        sendError(res, error.message, 400);
    }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
    try {
        let query;

        // Admin sees all, user sees only theirs
        if (req.user.role === 'admin') {
            query = Booking.find().populate('car', 'name brand model');
        } else {
            query = Booking.find({ user: req.user._id }).populate('car', 'name brand model');
        }

        const bookings = await query.sort('-createdAt');
        sendSuccess(res, bookings);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private/Public (if email/ID match)
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('car');
        if (!booking) {
            return sendError(res, 'Booking not found', 404);
        }

        // If logged in, check if it's theirs or if they are admin
        if (req.user) {
            if (req.user.role !== 'admin' && booking.user && booking.user.toString() !== req.user._id.toString()) {
                return sendError(res, 'Not authorized', 403);
            }
        }

        sendSuccess(res, booking);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return sendError(res, 'Booking not found', 404);
        }

        sendSuccess(res, booking, `Booking status updated to ${status}`);
    } catch (error) {
        sendError(res, error.message, 400);
    }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return sendError(res, 'Booking not found', 404);
        }

        // Check ownership
        if (req.user.role !== 'admin' && booking.user && booking.user.toString() !== req.user._id.toString()) {
            return sendError(res, 'Not authorized to cancel this booking', 403);
        }

        // Instead of deleting, we mark as cancelled
        booking.status = 'cancelled';
        await booking.save();

        sendSuccess(res, booking, 'Booking successfully cancelled');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get available booking extras
// @route   GET /api/bookings/extras
// @access  Public
exports.getBookingExtras = async (req, res) => {
    try {
        const extras = await BookingExtra.find({ available: true });

        return sendSuccess(res, extras);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};
