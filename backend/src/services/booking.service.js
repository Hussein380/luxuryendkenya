const Booking = require('../models/Booking');
const Car = require('../models/Car');
const BookingExtra = require('../models/BookingExtra');

/**
 * Check if a car is available for a given date range
 */
exports.checkCarAvailability = async (carId, pickupDate, returnDate) => {
    const car = await Car.findById(carId);
    if (!car || !car.available) return false;

    // Find any bookings for this car that overlap with the requested dates
    const overlappingBooking = await Booking.findOne({
        car: carId,
        status: { $in: ['confirmed', 'active', 'pending'] },
        $or: [
            {
                pickupDate: { $lte: returnDate },
                returnDate: { $gte: pickupDate }
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

    const diffTime = Math.abs(new Date(returnDate) - new Date(pickupDate));
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    let totalPrice = car.pricePerDay * totalDays;

    if (extraIds.length > 0) {
        const extras = await BookingExtra.find({ id: { $in: extraIds } });
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
