const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Location = require('../models/Location');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalBookings,
            activeBookings,
            totalCars,
            availableCars,
            recentBookings,
            revenueData
        ] = await Promise.all([
            Booking.countDocuments(),
            Booking.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
            Car.countDocuments(),
            Car.countDocuments({ available: true }),
            Booking.find()
                .sort('-createdAt')
                .limit(5)
                .populate('car', 'name brand model'),
            Booking.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
            ])
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        const stats = {
            totalRevenue,
            totalBookings,
            activeBookings,
            totalCars,
            availableCars,
            recentBookings
        };

        sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

/**
 * @desc    Create a new location
 * @route   POST /api/admin/locations
 * @access  Private/Admin
 */
exports.createLocation = async (req, res) => {
    try {
        const location = await Location.create(req.body);
        sendSuccess(res, location, 'Location created successfully', 201);
    } catch (error) {
        sendError(res, error.message, 400);
    }
};

/**
 * @desc    Update a location
 * @route   PUT /api/admin/locations/:id
 * @access  Private/Admin
 */
exports.updateLocation = async (req, res) => {
    try {
        const location = await Location.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!location) {
            return sendError(res, 'Location not found', 404);
        }

        sendSuccess(res, location, 'Location updated successfully');
    } catch (error) {
        sendError(res, error.message, 400);
    }
};

/**
 * @desc    Delete/Deactivate a location
 * @route   DELETE /api/admin/locations/:id
 * @access  Private/Admin
 */
exports.deleteLocation = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);

        if (!location) {
            return sendError(res, 'Location not found', 404);
        }

        // We do a soft delete by marking as inactive
        location.isActive = false;
        await location.save();

        sendSuccess(res, null, 'Location deactivated successfully');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};
