const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

// All order routes require authentication
router.use(verifyToken);

// Razorpay routes
router.post('/razorpay/create', orderController.createRazorpayOrder);
router.post('/razorpay/verify', orderController.verifyRazorpayPayment);

// Customer routes
router.post('/', orderController.placeOrder);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);

module.exports = router;
