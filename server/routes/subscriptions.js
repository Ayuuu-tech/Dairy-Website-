const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Customer routes
router.post('/', verifyToken, subscriptionController.createSubscription);
router.get('/my', verifyToken, subscriptionController.getMySubscriptions);
router.put('/:id/status', verifyToken, subscriptionController.updateSubscriptionStatus);

// Admin routes
router.get('/all', verifyToken, isAdmin, subscriptionController.getAllSubscriptions);

module.exports = router;
