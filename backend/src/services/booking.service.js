const Booking = require('../models/Booking');
const Car = require('../models/Car');
const BookingExtra = require('../models/BookingExtra');

/**
 * Check if a car is available for a given date range
 */
exports.checkCarAvailability = async (carId, pickupDate, returnDate) => {
    const car = await Car.findById(carId);
    if (!car) return false;
    // We don't strictly check car.available here because we want to see 
    // if it's available for SPECIFIC future dates, not just "right now"

    // Find any bookings for this car that overlap with the requested dates
    const overlappingBooking = await Booking.findOne({
        car: carId,
        status: { $in: ['confirmed', 'active', 'pending', 'paid', 'reserved'] },
        $or: [
            {
                pickupDate: { $lt: new Date(returnDate) },
                returnDate: { $gt: new Date(pickupDate) }
            }
        ]
    });

    return !overlappingBooking;
};

/**
 * Calculate total price for a booking
 */
exports.calculateTotalPrice = async (carId, pickupDate, returnDate, extraIds = []) => {
    const car = await Car.findById(carId);
    if (!car) throw new Error('Car not found');

    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    // Calculate total hours and convert to days (rounding up)
    const diffMs = returnD.getTime() - pickup.getTime();
    if (diffMs <= 0) throw new Error('Return date must be after pickup date');

    const diffHours = diffMs / (1000 * 60 * 60);
    const totalDays = Math.ceil(diffHours / 24);

    let totalPrice = car.pricePerDay * totalDays;

    if (extraIds && extraIds.length > 0) {
        // Handle both ID array and stringified JSON array
        const processedExtraIds = Array.isArray(extraIds) ? extraIds : JSON.parse(extraIds);
        const extras = await BookingExtra.find({ id: { $in: processedExtraIds } });
        const extrasPrice = extras.reduce((sum, extra) => sum + extra.pricePerDay, 0);
        totalPrice += extrasPrice * totalDays;
    }

    return { totalDays, totalPrice };
};

/**
 * Generate a unique booking ID
 */
exports.generateBookingId = () => {
    return 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
};
