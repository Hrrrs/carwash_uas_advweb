const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAdmin } = require('../middleware/authMiddleware');

// All routes require admin
router.use(requireAdmin);

// List all products
router.get('/', productController.getAllProducts);

// Add product form
router.get('/add', productController.getAddProduct);
router.post('/add', productController.postAddProduct);

// Edit product form
router.get('/edit/:id', productController.getEditProduct);
router.post('/edit/:id', productController.postEditProduct);

// Delete product
router.post('/delete/:id', productController.deleteProduct);

module.exports = router;
