const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const transController = require('../controllers/transController');
const { requireAdmin } = require('../middleware/authMiddleware');

// All routes require admin
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', transController.getAdminDashboard);

// Report
router.get('/report', reportController.getReport);

module.exports = router;
