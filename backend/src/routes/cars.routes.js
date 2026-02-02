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

// Public routes (cache temporarily disabled for debugging)
router.get('/', getCars);
router.get('/featured', getFeaturedCars);
router.get('/categories', getCategories);
router.get('/locations', getLocations);
router.get('/:id', getCarById);

// Admin routes
router.post('/', protect, restrictTo('admin'), uploadCarImage, validate(carCreateSchema), createCar);
router.put('/:id', protect, restrictTo('admin'), uploadCarImage, validate(carUpdateSchema), updateCar);
router.delete('/:id', protect, restrictTo('admin'), deleteCar);

module.exports = router;
