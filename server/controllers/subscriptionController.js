const db = require('../db');

// Customer: Create a new subscription
exports.createSubscription = async (req, res) => {
  try {
    const { product_id, plan_type, quantity, start_date } = req.body;
    
    if (!product_id || !plan_type) {
      return res.status(400).json({ message: 'Product ID and plan type are required' });
    }

    const { rows } = await db.query(
      `INSERT INTO subscriptions (user_id, product_id, plan_type, quantity, start_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, product_id, plan_type, quantity || 1, start_date || new Date()]
    );
    
    res.status(201).json({ message: 'Subscription created successfully', subscription: rows[0] });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error creating subscription' });
  }
};

// Customer: Get my subscriptions
exports.getMySubscriptions = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT s.*, p.name as product_name, p.images[1] as image_url, (p.variants->0->>'price')::numeric as price
       FROM subscriptions s
       JOIN products p ON s.product_id = p.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get my subscriptions error:', error);
    res.status(500).json({ message: 'Server error fetching subscriptions' });
  }
};

// Customer/Admin: Update subscription status (pause/cancel/resume)
exports.updateSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['active', 'paused', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Verify ownership if not admin
    if (req.user.role !== 'admin') {
      const check = await db.query('SELECT user_id FROM subscriptions WHERE id = $1', [id]);
      if (check.rows.length === 0 || check.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this subscription' });
      }
    }

    const { rows } = await db.query(
      'UPDATE subscriptions SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json({ message: `Subscription ${status}`, subscription: rows[0] });
  } catch (error) {
    console.error('Update subscription status error:', error);
    res.status(500).json({ message: 'Server error updating subscription' });
  }
};

// Admin: Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT s.*, 
              u.name as customer_name, u.phone as customer_phone, u.email as customer_email, u.addresses,
              p.name as product_name, p.images[1] as image_url, (p.variants->0->>'price')::numeric as price
       FROM subscriptions s
       JOIN users u ON s.user_id = u.id
       JOIN products p ON s.product_id = p.id
       ORDER BY s.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get all subscriptions error:', error);
    res.status(500).json({ message: 'Server error fetching subscriptions' });
  }
};
