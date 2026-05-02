const jwt = require('jsonwebtoken');
const db = require('../db');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await db.query(
      'SELECT id, name, phone, email, role, addresses, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );
    if (rows.length === 0) return res.status(401).json({ message: 'User not found.' });

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired.' });
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
};

module.exports = { verifyToken, isAdmin };
