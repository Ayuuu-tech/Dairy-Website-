require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const db = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const subscriptionRoutes = require('./routes/subscriptions');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Database Check ──────────────────────────────────────────
db.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL (Supabase) connected successfully'))
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err.message);
    console.log('⚠️  Server will continue running but database operations will fail');
  });

// ─── Health Check ────────────────────────────────────────────
app.get('/', async (req, res) => {
  let dbStatus = 'disconnected';
  try { await db.query('SELECT 1'); dbStatus = 'connected'; } catch (e) {}
  res.json({ name: 'DairyFresh API', version: '2.0.0', database: 'PostgreSQL (Supabase)', status: dbStatus });
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// ─── Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 DairyFresh server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
