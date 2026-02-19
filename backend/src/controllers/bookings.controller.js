const Booking = require('../models/Booking');
const BookingExtra = require('../models/BookingExtra');
const Car = require('../models/Car');
const bookingService = require('../services/booking.service');
const { sendSuccess, sendError } = require('../utils/response');
const { addEmailJob } = require('../services/queue.service');
const mpesaService = require('../services/mpesa.service');
const logger = require('../utils/logger');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public (Optional Auth)
exports.createBooking = async (req, res) => {
    try {
        const {
            carId,
            firstName,
            lastName,
            customerEmail,
            customerPhone,
            pickupDate,
            returnDate,
            pickupLocation,
            returnLocation,
            extras,
            bookingType
        } = req.body;

        // 1. Check for documents
        if (!req.files || !req.files.idImage || !req.files.licenseImage) {
            return sendError(res, 'ID and License images are required', 400);
        }

        const idImageUrl = req.files.idImage[0].path;
        const licenseImageUrl = req.files.licenseImage[0].path;

        // 2. Check Availability
        const isAvailable = await bookingService.checkCarAvailability(carId, new Date(pickupDate), new Date(returnDate));
        if (!isAvailable) {
            return sendError(res, 'Car is not available for the selected dates', 400);
        }

        // 3. Calculate Pricing
        const { totalDays, totalPrice } = await bookingService.calculateTotalPrice(
            carId,
            new Date(pickupDate),
            new Date(returnDate),
            extras
        );

        // 4. Create Booking
        const bookingId = bookingService.generateBookingId();
        const initialStatus = bookingType === 'reserve' ? 'reserved' : 'pending';

        const booking = await Booking.create({
            bookingId,
            car: carId,
            user: req.user ? req.user._id : null,
            firstName,
            lastName,
            customerEmail,
            customerPhone,
            pickupDate,
            returnDate,
            pickupLocation,
            returnLocation,
            extras,
            totalDays,
            totalPrice,
            idImageUrl,
            licenseImageUrl,
            bookingType,
            status: initialStatus
        });

        // 5. Handle Flow Logic
        if (bookingType === 'book_now') {
            // Initiate M-Pesa STK Push
            try {
                const stkResult = await mpesaService.initiateStkPush(customerPhone, totalPrice, bookingId);
                return sendSuccess(res, { booking, stkResult }, 'Booking initiated. Please complete payment on your phone.', 201);
            } catch (err) {
                logger.error(`Initial STK Push failed for ${bookingId}: ${err.message}`);
                // Instead of success, return error so frontend doesn't jump to confirmation page
                return sendError(res, `Payment initiation failed: ${err.message}. Please try again from your dashboard.`, 400);
            }
        } else {
            // Reserve flow - Notify Admin
            if (ADMIN_EMAIL) {
                const car = await Car.findById(carId).select('name').lean();
                await addEmailJob('admin-new-reservation', {
                    to: ADMIN_EMAIL,
                    bookingId,
                    customerName: `${firstName} ${lastName}`,
                    customerEmail,
                    customerPhone,
                    carName: car?.name || 'N/A',
                    pickupDate,
                    totalPrice
                });
            }
            return sendSuccess(res, booking, 'Reservation submitted successfully. Admin will contact you soon.', 201);
        }
    } catch (error) {
        logger.error(`Create Booking error: ${error.message}`);
        sendError(res, error.message, 400);
    }
};

// @desc    Get all bookings
// @route   GET /api/bookings (admin) or GET /api/bookings/my (user)
// @access  Private
exports.getBookings = async (req, res) => {
    try {
        let query;

        // Admin sees all, user sees only theirs
        if (req.user.role === 'admin') {
            query = Booking.find().populate('car', 'name brand model imageUrl pricePerDay');
        } else {
            query = Booking.find({ user: req.user._id }).populate('car', 'name brand model imageUrl pricePerDay');
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
        ).populate('car', 'name');

        if (!booking) {
            return sendError(res, 'Booking not found', 404);
        }

        // When admin confirms, send "Booking Confirmed!" email to client
        if (status === 'confirmed') {
            await addEmailJob('booking-confirmation', {
                bookingId: booking.bookingId,
                customerName: booking.customerName,
                customerEmail: booking.customerEmail,
                carName: booking.car?.name || 'N/A',
                pickupDate: booking.pickupDate,
                returnDate: booking.returnDate,
                pickupLocation: booking.pickupLocation,
                totalPrice: booking.totalPrice
            });
        }

        sendSuccess(res, booking, `Booking status updated to ${status}`);
    } catch (error) {
        sendError(res, error.message, 400);
    }
};

// @desc    M-Pesa Callback handler
// @route   POST /api/bookings/mpesa-callback
// @access  Public (M-Pesa)
exports.handleMpesaCallback = async (req, res) => {
    try {
        const { Body } = req.body;
        const { stkCallback } = Body;
        const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } = stkCallback;

        const bookingId = CallbackMetadata?.Item?.find(i => i.Name === 'AccountReference')?.Value;
        // In some cases M-Pesa might not return the reference, so we might need CheckoutRequestID
        // But for this impl, we'll try to find by ID if reference is missing

        const booking = await Booking.findOne({
            $or: [
                { bookingId: bookingId },
                { 'paymentDetails.transactionId': CheckoutRequestID }
            ]
        });

        if (!booking) {
            logger.warn(`M-Pesa Callback: Booking not found for ${bookingId} / ${CheckoutRequestID}`);
            return res.json({ ResultCode: 1, ResultDesc: 'Rejected' });
        }

        if (ResultCode === 0) {
            // Success
            const amount = CallbackMetadata.Item.find(i => i.Name === 'Amount')?.Value;
            const mpesaReceiptNumber = CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
            const transactionDate = CallbackMetadata.Item.find(i => i.Name === 'TransactionDate')?.Value;

            booking.status = 'paid';
            booking.paymentDetails = {
                transactionId: CheckoutRequestID,
                amount,
                paidAt: new Date(),
                mpesaReceiptNumber,
                resultDesc: ResultDesc
            };
            await booking.save();

            // AUTOMATION: Mark car as unavailable if it's currently in the rental period
            const now = new Date();
            if (now >= booking.pickupDate && now <= booking.returnDate) {
                await Car.findByIdAndUpdate(booking.car, { available: false });
            }

            // Send receipt email
            await addEmailJob('booking-receipt', {
                bookingId: booking.bookingId,
                customerName: `${booking.firstName} ${booking.lastName}`,
                customerEmail: booking.customerEmail,
                carName: (await Car.findById(booking.car).select('name').lean())?.name || 'N/A',
                amount,
                receiptNumber: mpesaReceiptNumber,
                paidAt: booking.paymentDetails.paidAt
            });

            logger.info(`M-Pesa Payment Success: ${booking.bookingId} - ${mpesaReceiptNumber}`);
        } else {
            // Failed
            booking.status = 'cancelled';
            booking.paymentDetails = {
                transactionId: CheckoutRequestID,
                resultDesc: ResultDesc
            };
            await booking.save();
            logger.info(`M-Pesa Payment Failed: ${booking.bookingId} - ${ResultDesc}`);
        }

        res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (error) {
        logger.error(`M-Pesa Callback Error: ${error.message}`);
        res.status(500).json({ ResultCode: 1, ResultDesc: 'Internal Server Error' });
    }
};

// @desc    Manually confirm payment (Admin)
// @route   POST /api/bookings/:id/confirm-payment
// @access  Private/Admin
exports.confirmPayment = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return sendError(res, 'Booking not found', 404);
        }

        const { mpesaReceiptNumber, amount } = req.body;

        booking.status = 'paid';
        booking.paymentDetails = {
            amount: amount || booking.totalPrice,
            paidAt: new Date(),
            mpesaReceiptNumber: mpesaReceiptNumber || 'MANUAL-CONFIRM',
            resultDesc: 'Manually confirmed by admin'
        };
        await booking.save();

        // AUTOMATION: Mark car as unavailable if it's currently in the rental period
        const now = new Date();
        if (now >= booking.pickupDate && now <= booking.returnDate) {
            await Car.findByIdAndUpdate(booking.car, { available: false });
        }

        // Send receipt email
        await addEmailJob('booking-receipt', {
            bookingId: booking.bookingId,
            customerName: `${booking.firstName} ${booking.lastName}`,
            customerEmail: booking.customerEmail,
            carName: (await Car.findById(booking.car).select('name').lean())?.name || 'N/A',
            amount: booking.paymentDetails.amount,
            receiptNumber: booking.paymentDetails.mpesaReceiptNumber,
            paidAt: booking.paymentDetails.paidAt
        });

        sendSuccess(res, booking, 'Payment manually confirmed');
    } catch (error) {
        sendError(res, error.message, 500);
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

// @desc    Get unavailable/booked dates for a specific car
// @route   GET /api/cars/:id/unavailable-dates
// @access  Public
exports.getUnavailableDates = async (req, res) => {
    try {
        const { id: carId } = req.params;

        // Get all active bookings for this car (pending, confirmed, active)
        const bookings = await Booking.find({
            car: carId,
            status: { $in: ['pending', 'confirmed', 'active'] },
            returnDate: { $gte: new Date() } // Only future/current bookings
        }).select('pickupDate returnDate status');

        // Return array of date ranges that are unavailable
        const unavailableDates = bookings.map(booking => ({
            start: booking.pickupDate,
            end: booking.returnDate,
            status: booking.status
        }));

        sendSuccess(res, unavailableDates);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};
