const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const categoriesController = require('../controllers/categories.controller');
const revenueController = require('../controllers/revenue.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All routes here are protected and restricted to admin
router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', adminController.getDashboardStats);

// Revenue routes
router.get('/revenue', revenueController.getRevenue);
router.get('/revenue/export/csv', revenueController.exportRevenueCSV);
router.get('/revenue/export/pdf', revenueController.exportRevenuePDF);

// Category management
router.get('/categories', categoriesController.getAllCategories);
router.post('/categories', categoriesController.createCategory);
router.put('/categories/:id', categoriesController.updateCategory);
router.delete('/categories/:id', categoriesController.deleteCategory);

module.exports = router;
