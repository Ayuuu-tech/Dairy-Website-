const db = require('../db');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey123456',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummysecret1234567890dummy'
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ message: 'Amount required' });

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount });
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummysecret1234567890dummy')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Verify Error:', error);
    res.status(500).json({ message: 'Server error verifying payment' });
  }
};
exports.placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, slot, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) return res.status(400).json({ message: 'Order must have items' });
    if (!deliveryAddress?.street || !deliveryAddress?.city || !deliveryAddress?.pincode) return res.status(400).json({ message: 'Address required' });
    if (!slot) return res.status(400).json({ message: 'Slot required' });
    if (!paymentMethod) return res.status(400).json({ message: 'Payment method required' });

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const { rows } = await db.query('SELECT * FROM products WHERE id = $1', [item.productId]);
      if (rows.length === 0) return res.status(404).json({ message: `Product not found: ${item.productId}` });

      const product = rows[0];
      const variant = product.variants.find(v => v.label === item.variantLabel);
      if (!variant) return res.status(400).json({ message: `Variant "${item.variantLabel}" not found` });
      if (variant.stock < item.qty) return res.status(400).json({ message: `Insufficient stock for ${product.name}` });

      totalAmount += variant.price * item.qty;
      orderItems.push({ productId: product.id, variantLabel: item.variantLabel, qty: item.qty, price: variant.price });

      // Deduct stock
      const updatedVariants = product.variants.map(v => v.label === item.variantLabel ? { ...v, stock: v.stock - item.qty } : v);
      await db.query('UPDATE products SET variants = $1 WHERE id = $2', [JSON.stringify(updatedVariants), product.id]);
    }

    const { rows } = await db.query(
      'INSERT INTO orders (user_id, items, delivery_address, slot, payment_method, total_amount, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [userId, JSON.stringify(orderItems), JSON.stringify(deliveryAddress), slot, paymentMethod.toUpperCase(), totalAmount, 'Pending']
    );
    res.status(201).json({ message: 'Order placed', order: rows[0] });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error placing order' }); }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ orders: rows });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
};

exports.getOrder = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Order not found' });

    const order = rows[0];
    if (order.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    res.json({ order });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = 'SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone FROM orders o JOIN users u ON o.user_id = u.id WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM orders WHERE 1=1';
    const params = []; const cParams = [];
    let i = 1; let ci = 1;

    if (status && status !== 'All') {
      query += ` AND o.status = $${i++}`; params.push(status);
      countQuery += ` AND status = $${ci++}`; cParams.push(status);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const total = (await db.query(countQuery, cParams)).rows[0].count;

    query += ` ORDER BY o.created_at DESC LIMIT $${i++} OFFSET $${i++}`;
    params.push(parseInt(limit), offset);

    const { rows } = await db.query(query, params);
    res.json({ orders: rows, pagination: { total: parseInt(total), page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) } });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const existing = await db.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: 'Order not found' });

    const order = existing.rows[0];
    // Restore stock on cancel
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        const { rows } = await db.query('SELECT * FROM products WHERE id = $1', [item.productId]);
        if (rows.length > 0) {
          const product = rows[0];
          const updated = product.variants.map(v => v.label === item.variantLabel ? { ...v, stock: v.stock + item.qty } : v);
          await db.query('UPDATE products SET variants = $1 WHERE id = $2', [JSON.stringify(updated), product.id]);
        }
      }
    }

    const { rows } = await db.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    res.json({ message: `Status updated to "${status}"`, order: rows[0] });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
};
