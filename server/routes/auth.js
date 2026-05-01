const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// POST /api/auth/send-otp
router.post('/send-otp', authController.sendOtp);

// POST /api/auth/verify-otp
router.post('/verify-otp', authController.verifyOtp);

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/google
router.post('/google', authController.googleAuth);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// GET /api/auth/me (protected)
router.get('/me', verifyToken, authController.getMe);

// PUT /api/auth/profile (protected)
router.put('/profile', verifyToken, authController.updateProfile);

module.exports = router;
