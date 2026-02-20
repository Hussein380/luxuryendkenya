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

        // 2. Acquire lock to prevent race conditions
        const lockAcquired = bookingService.acquireBookingLock(carId);
        if (!lockAcquired) {
            return sendError(res, 'This car is being booked by another user. Please try again in a few seconds.', 429);
        }

        try {
            // 3. Check Availability (double-check after acquiring lock)
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
        // CLEAR CACHE: New booking affects car availability dates
        const { clearCarCache } = require('../config/redis.config');
        await clearCarCache();

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
        } finally {
            // Release lock regardless of success or failure
            bookingService.releaseBookingLock(carId);
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
                customerName: `${booking.firstName} ${booking.lastName}`,
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
                
                // CLEAR CACHE: Car availability changed
                const { clearCarCache } = require('../config/redis.config');
                await clearCarCache();
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
            
            // CLEAR CACHE: Car availability changed
            const { clearCarCache } = require('../config/redis.config');
            await clearCarCache();
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

        // CLEAR CACHE: Cancelled booking frees up dates
        const { clearCarCache } = require('../config/redis.config');
        await clearCarCache();

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
            status: { $in: ['pending', 'confirmed', 'active', 'paid', 'overdue', 'reserved'] },
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
// @desc    Start trip (Checkout)
// @route   POST /api/bookings/:id/start-trip
// @access  Private/Admin
exports.startTrip = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return sendError(res, 'Booking not found', 404);

        if (booking.status !== 'paid') {
            return sendError(res, 'Booking must be paid before starting trip', 400);
        }

        booking.status = 'active';
        await booking.save();

        // Ensure car is marked as unavailable during the trip
        await Car.findByIdAndUpdate(booking.car, { available: false });

        // CLEAR CACHE: Ensure website hides car instantly
        const { clearCarCache } = require('../config/redis.config');
        await clearCarCache();

        sendSuccess(res, booking, 'Trip started successfully');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Check in car and calculate penalty
// @route   POST /api/bookings/:id/check-in
// @access  Private/Admin
exports.checkIn = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('car');
        if (!booking) return sendError(res, 'Booking not found', 404);

        const actualReturnDate = new Date();
        const expectedReturnDate = new Date(booking.returnDate);
        const car = await Car.findById(booking.car);

        // Calculate late fee penalty
        const diffMs = actualReturnDate - expectedReturnDate;
        const diffHours = diffMs / (1000 * 60 * 60);

        let penaltyAmount = 0;
        let penaltyReason = 'None';

        if (diffHours > 1) { // 1 hour grace period
            const dailyRate = car.pricePerDay;
            if (diffHours <= 6) {
                penaltyAmount = dailyRate * 0.5;
                penaltyReason = `Late Return (${diffHours.toFixed(1)} hours overdue)`;
            } else {
                penaltyAmount = dailyRate;
                penaltyReason = `Late Return (>6 hours overdue - Full Day Charge)`;
            }
        }

        booking.actualReturnDate = actualReturnDate;
        booking.status = 'completed';

        if (penaltyAmount > 0) {
            booking.penaltyFee = {
                amount: penaltyAmount,
                status: 'pending',
                reason: penaltyReason
            };
        } else {
            booking.penaltyFee = {
                amount: 0,
                status: 'none',
                reason: 'Returned on time'
            };
        }

        await booking.save();

        // AUTOMATION: Mark car as available again
        const carId = booking.car._id || booking.car;
        await Car.findByIdAndUpdate(carId, { available: true });

        // CLEAR CACHE: Ensure website shows car as available immediately
        const { clearCarCache } = require('../config/redis.config');
        await clearCarCache();

        sendSuccess(res, booking, 'Check-in completed successfully');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Update penalty fee (Admin negotiation)
// @route   PATCH /api/bookings/:id/penalty
// @access  Private/Admin
exports.updatePenalty = async (req, res) => {
    try {
        const { amount, status, reason } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return sendError(res, 'Booking not found', 404);

        if (amount !== undefined) booking.penaltyFee.amount = amount;
        if (status !== undefined) booking.penaltyFee.status = status;
        if (reason !== undefined) booking.penaltyFee.reason = reason;

        // If status is set to waived, set amount to 0 check
        if (status === 'waived') {
            booking.penaltyFee.amount = 0;
        }

        await booking.save();
        sendSuccess(res, booking, 'Penalty fee updated successfully');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Initiate M-Pesa payment for penalty
// @route   POST /api/bookings/:id/pay-penalty
// @access  Private/Admin
exports.payPenalty = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return sendError(res, 'Booking not found', 404);

        if (booking.penaltyFee.status !== 'pending' || booking.penaltyFee.amount <= 0) {
            return sendError(res, 'No pending penalty fee to pay', 400);
        }

        // Initiate STK Push for penalty amount
        const stkResult = await mpesaService.initiateStkPush(
            booking.customerPhone,
            booking.penaltyFee.amount,
            `${booking.bookingId}-PN` // Identify as penalty
        );

        sendSuccess(res, stkResult, 'Penalty payment initiated');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Manually mark booking as overdue
// @route   POST /api/bookings/:id/mark-overdue
// @access  Private/Admin
exports.markAsOverdue = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return sendError(res, 'Booking not found', 404);

        if (booking.status !== 'active') {
            return sendError(res, 'Only active trips can be marked as overdue', 400);
        }

        booking.status = 'overdue';
        await booking.save();

        // Send the alert email manually now
        const { sendOverdueAlert } = require('../services/email.service');
        await sendOverdueAlert(booking);

        sendSuccess(res, booking, 'Booking marked as overdue and alert sent');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Admin: Mark booking as No-Show and release car
// @route   POST /api/bookings/:id/no-show
// @access  Private/Admin
exports.markNoShow = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return sendError(res, 'Booking not found', 404);

        if (['pending', 'reserved', 'confirmed', 'paid'].indexOf(booking.status) === -1) {
            return sendError(res, 'Only upcoming bookings can be marked as No-Show', 400);
        }

        booking.status = 'cancelled';
        booking.penaltyFee = {
            amount: 0,
            status: 'none',
            reason: 'Cancelled due to No-Show'
        };
        await booking.save();

        // Release the car
        await Car.findByIdAndUpdate(booking.car, { available: true });

        // CLEAR CACHE
        const { clearCarCache } = require('../config/redis.config');
        await clearCarCache();

        sendSuccess(res, booking, 'Booking marked as No-Show and car released');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Extend a trip (Admin or User)
// @route   POST /api/bookings/:id/extend
// @access  Private
exports.extendTrip = async (req, res) => {
    try {
        const { newReturnDate } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return sendError(res, 'Booking not found', 404);

        // Check if new return date is valid
        if (new Date(newReturnDate) <= new Date(booking.returnDate)) {
            return sendError(res, 'New return date must be after current return date', 400);
        }

        // Check availability for the extension period
        const isAvailable = await bookingService.checkCarAvailability(
            booking.car,
            booking.returnDate, // check from old return date 
            newReturnDate // to the new one
        );

        if (!isAvailable) {
            return sendError(res, 'Car is already booked for the extension period', 400);
        }

        // Update booking and recalculate final totalPrice if needed (logic omitted for brevity but recommended)
        booking.returnDate = newReturnDate;
        await booking.save();

        sendSuccess(res, booking, 'Trip extended successfully');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};
