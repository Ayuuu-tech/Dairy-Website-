const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const adminController = require('../controllers/adminController');
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken, isAdmin);

// Dashboard stats
router.get('/stats', adminController.getStats);

// User management
router.get('/users', adminController.getUsers);

// Order management
router.get('/orders', orderController.getAllOrders);
router.put('/orders/:id/status', orderController.updateOrderStatus);

// Subscription management
router.get('/subscriptions', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT s.*, u.name as user_name, u.email as user_email, u.phone as user_phone FROM subscriptions s JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC'
    );
    res.json({ subscriptions: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching subscriptions' });
  }
});

module.exports = router;
