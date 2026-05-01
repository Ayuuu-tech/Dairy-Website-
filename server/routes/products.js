const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);
router.get('/:id/reviews', productController.getReviews);

// Protected routes (admin only)
router.post('/', verifyToken, isAdmin, productController.createProduct);
router.put('/:id', verifyToken, isAdmin, productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

// Protected routes (customer - review)
router.post('/:id/reviews', verifyToken, productController.addReview);

module.exports = router;
