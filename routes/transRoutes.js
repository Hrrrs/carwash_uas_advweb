const express = require('express');
const router = express.Router();
const transController = require('../controllers/transController');
const { requireAuth, requireAdmin, verifyToken } = require('../middleware/authMiddleware');

// Customer routes
router.get('/order', verifyToken, requireAuth, transController.getOrderPage);
router.post('/order', verifyToken, requireAuth, transController.submitOrder);

// Admin routes
router.get('/admin/dashboard', requireAdmin, transController.getAdminDashboard);
router.get('/admin/pos/:id', requireAdmin, transController.getPOS);
router.post('/admin/pos/:id/add-service', requireAdmin, transController.addService);
router.post('/admin/pos/:id/pay', requireAdmin, transController.processPayment);
router.post('/admin/pos/:transId/delete/:itemId', requireAdmin, transController.deleteItem);

module.exports = router;
