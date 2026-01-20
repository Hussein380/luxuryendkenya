const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All routes here are protected and restricted to admin
router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', adminController.getDashboardStats);

// Location management
router.post('/locations', adminController.createLocation);
router.put('/locations/:id', adminController.updateLocation);
router.delete('/locations/:id', adminController.deleteLocation);

module.exports = router;
