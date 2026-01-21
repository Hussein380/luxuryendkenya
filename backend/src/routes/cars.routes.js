const express = require('express');
const {
    getCars,
    getCarById,
    getFeaturedCars,
    getCategories,
    getLocations,
    createCar,
    updateCar,
    deleteCar
} = require('../controllers/cars.controller');

const { protect, restrictTo } = require('../middleware/auth.middleware');
const { uploadCarImage } = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const { carCreateSchema, carUpdateSchema } = require('../utils/schemas/car.schema');
const cache = require('../middleware/cache.middleware');

const router = express.Router();

// Public routes
router.get('/', cache(300), getCars); // Cache list for 5 mins
router.get('/featured', cache(3600), getFeaturedCars); // Cache featured for 1 hour
router.get('/categories', cache(86400), getCategories); // Cache categories for 1 day
router.get('/locations', cache(86400), getLocations); // Cache locations for 1 day
router.get('/:id', getCarById);

// Admin routes
router.post('/', protect, restrictTo('admin'), uploadCarImage, validate(carCreateSchema), createCar);
router.put('/:id', protect, restrictTo('admin'), uploadCarImage, validate(carUpdateSchema), updateCar);
router.delete('/:id', protect, restrictTo('admin'), deleteCar);

module.exports = router;
