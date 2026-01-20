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

const router = express.Router();

// Public routes
router.get('/', getCars);
router.get('/featured', getFeaturedCars);
router.get('/categories', getCategories);
router.get('/locations', getLocations);
router.get('/:id', getCarById);

// Admin routes
router.post('/', protect, restrictTo('admin'), createCar);
router.put('/:id', protect, restrictTo('admin'), updateCar);
router.delete('/:id', protect, restrictTo('admin'), deleteCar);

module.exports = router;
