const Car = require('../models/Car');
const Location = require('../models/Location');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Get all cars with filters/search
// @route   GET /api/cars
// @access  Public
exports.getCars = async (req, res) => {
    try {
        const query = { ...req.query };

        // Remove fields that are not filters
        const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
        removeFields.forEach(param => delete query[param]);

        // Create query string for advanced operators ($gt, $gte, etc)
        let queryStr = JSON.stringify(query);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        let mongooseQuery = Car.find(JSON.parse(queryStr));

        // Text search
        if (req.query.search) {
            mongooseQuery = Car.find({
                $text: { $search: req.query.search },
                ...JSON.parse(queryStr)
            });
        }

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            mongooseQuery = mongooseQuery.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            mongooseQuery = mongooseQuery.sort(sortBy);
        } else {
            mongooseQuery = mongooseQuery.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const startIndex = (page - 1) * limit;
        const total = await Car.countDocuments(JSON.parse(queryStr));

        mongooseQuery = mongooseQuery.skip(startIndex).limit(limit);

        // Executing query
        const cars = await mongooseQuery;

        sendSuccess(res, {
            cars,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Public
exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return sendError(res, 'Car not found', 404);
        }
        sendSuccess(res, car);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get featured cars
// @route   GET /api/cars/featured
// @access  Public
exports.getFeaturedCars = async (req, res) => {
    try {
        const cars = await Car.find({ rating: { $gte: 4.5 } }).limit(6);
        sendSuccess(res, cars);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get all unique categories
// @route   GET /api/cars/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Car.distinct('category');
        sendSuccess(res, categories);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get all locations
// @route   GET /api/cars/locations
// @access  Public
exports.getLocations = async (req, res) => {
    try {
        const locations = await Location.find({ isActive: true }).select('name');
        const locationNames = locations.map(loc => loc.name);

        sendSuccess(res, locationNames);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Create car
// @route   POST /api/cars
// @access  Private/Admin
exports.createCar = async (req, res) => {
    try {
        const carData = { ...req.body };

        // If a file was uploaded, use its URL
        if (req.file) {
            carData.imageUrl = req.file.path;
        }

        // Handle nested or stringified features/data if sent via FormData
        if (typeof carData.features === 'string') {
            try {
                carData.features = JSON.parse(carData.features);
            } catch (e) {
                carData.features = carData.features.split(',').map(f => f.trim());
            }
        }

        // Generate name from brand and model if missing
        if (!carData.name && carData.brand && carData.model) {
            carData.name = `${carData.brand} ${carData.model}`;
        }

        const car = await Car.create(carData);
        sendSuccess(res, car, 'Car created successfully', 201);
    } catch (error) {
        console.error('Create Car Error:', error);
        sendError(res, error.message, 400);
    }
};

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private/Admin
exports.updateCar = async (req, res) => {
    try {
        let car = await Car.findById(req.params.id);
        if (!car) {
            return sendError(res, 'Car not found', 404);
        }

        const carData = { ...req.body };

        // If a new file was uploaded, use its URL
        if (req.file) {
            carData.imageUrl = req.file.path;
        }

        // Handle stringified features
        if (typeof carData.features === 'string') {
            try {
                carData.features = JSON.parse(carData.features);
            } catch (e) {
                carData.features = carData.features.split(',').map(f => f.trim());
            }
        }

        // Generate name from brand and model if missing
        if (!carData.name && carData.brand && carData.model) {
            carData.name = `${carData.brand} ${carData.model}`;
        }

        car = await Car.findByIdAndUpdate(req.params.id, carData, {
            new: true,
            runValidators: true
        });

        sendSuccess(res, car, 'Car updated successfully');
    } catch (error) {
        console.error('Update Car Error:', error);
        sendError(res, error.message, 400);
    }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private/Admin
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return sendError(res, 'Car not found', 404);
        }

        await car.deleteOne();
        sendSuccess(res, null, 'Car deleted successfully');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};
