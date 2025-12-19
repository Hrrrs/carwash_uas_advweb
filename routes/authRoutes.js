const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Apply verifyToken to all routes
router.use(verifyToken);

// Login Routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Signup Routes
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);

// Logout Route
router.get('/logout', authController.logout);

module.exports = router;
