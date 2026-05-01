const db = require('../db');

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's orders & revenue
    const todayOrders = await db.query(
      "SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE created_at >= $1 AND status != 'Cancelled'",
      [today.toISOString()]
    );

    // Active subscriptions
    const activeSubs = await db.query("SELECT COUNT(*) FROM subscriptions WHERE status = 'Active'");

    // Pending deliveries
    const pending = await db.query("SELECT COUNT(*) FROM orders WHERE status IN ('Pending', 'Confirmed', 'Out for Delivery')");

    // Low stock products
    const { rows: products } = await db.query('SELECT id, name, category, images, variants FROM products WHERE available = true');
    const lowStock = [];
    products.forEach(p => {
      p.variants.forEach(v => {
        if (v.stock <= 15) lowStock.push({ productId: p.id, name: p.name, category: p.category, image: p.images?.[0] || '', variant: v.label, stock: v.stock });
      });
    });

    // Weekly chart
    const weekData = [];
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(); date.setDate(date.getDate() - d); date.setHours(0, 0, 0, 0);
      const next = new Date(date); next.setDate(next.getDate() + 1);
      const { rows } = await db.query("SELECT COUNT(*) as count FROM orders WHERE created_at >= $1 AND created_at < $2 AND status != 'Cancelled'", [date.toISOString(), next.toISOString()]);
      weekData.push({ day: days[(date.getDay() + 6) % 7], orders: parseInt(rows[0].count) });
    }

    // Recent orders
    const { rows: recent } = await db.query(
      'SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 10'
    );

    res.json({
      todayOrders: parseInt(todayOrders.rows[0].count),
      todayRevenue: parseFloat(todayOrders.rows[0].revenue),
      activeSubscriptions: parseInt(activeSubs.rows[0].count),
      pendingDeliveries: parseInt(pending.rows[0].count),
      lowStock,
      weeklyChart: weekData,
      recentOrders: recent,
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error fetching stats' }); }
};

exports.getUsers = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, name, phone, email, role, addresses, created_at FROM users ORDER BY created_at DESC');
    res.json({ users: rows });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
};
