const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { Resend } = require('resend');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
// In-memory store for OTPs: Map<email, { otp, expiresAt }>
const otpStore = new Map();

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const setCookie = (res, token) => {
  res.cookie('token', token, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });
};

exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, role } = req.body;
    if (!name || !phone || !email || !password) return res.status(400).json({ message: 'All fields required' });

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRole = role === 'admin' ? 'admin' : 'customer';

    const { rows } = await db.query(
      'INSERT INTO users (name, phone, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, phone, email, role, addresses, created_at',
      [name, phone, email.toLowerCase(), passwordHash, userRole]
    );

    const token = generateToken(rows[0].id);
    setCookie(res, token);
    res.status(201).json({ message: 'Registration successful', user: rows[0] });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const emailLower = email.toLowerCase();
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP

    // Store OTP in memory (expires in 5 minutes)
    otpStore.set(emailLower, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    if (process.env.RESEND_API_KEY) {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'DairyFresh <auth@rahulyadav7900.tech>',
        to: emailLower,
        subject: `${otp} is your DairyFresh verification code`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f7f6;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f7f6;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="460" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #1D9E75 0%, #16a34a 100%); padding:32px 40px; text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">🥛 DairyFresh</div>
            <div style="color:rgba(255,255,255,0.85);font-size:13px;margin-top:6px;letter-spacing:0.5px;">FRESH • LOCAL • DELIVERED</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 20px;">
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Verify your email</h2>
            <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
              Use the code below to complete your sign-in. This code will expire in <strong style="color:#111827;">5 minutes</strong>.
            </p>
          </td>
        </tr>

        <!-- OTP Box -->
        <tr>
          <td style="padding:10px 40px 10px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr><td align="center">
                <div style="background:#f0fdf4;border:2px dashed #1D9E75;border-radius:12px;padding:24px 40px;display:inline-block;">
                  <span style="font-size:40px;font-weight:800;letter-spacing:14px;color:#1D9E75;font-family:'Courier New',monospace;">${otp}</span>
                </div>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Warning -->
        <tr>
          <td style="padding:20px 40px 32px;">
            <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:12px 16px;">
              <p style="margin:0;font-size:12px;color:#92400e;line-height:1.5;">
                ⚠️ <strong>Security tip:</strong> Never share this code with anyone. DairyFresh team will never ask for your OTP.
              </p>
            </div>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #f3f4f6;margin:0;"></td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;">This is an automated message from DairyFresh.</p>
            <p style="margin:0;font-size:11px;color:#9ca3af;">If you didn't request this code, you can safely ignore this email.</p>
            <div style="margin-top:16px;">
              <span style="font-size:11px;color:#d1d5db;">© ${new Date().getFullYear()} DairyFresh — All rights reserved</span>
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
      });
      if (error) {
        console.error('[Resend Error]:', error);
        return res.status(400).json({ message: error.message || 'Failed to send OTP via email. Check your Resend account configuration.' });
      }
      console.log(`[Resend] OTP sent to ${emailLower}`);
    } else {
      console.log(`[Mock Resend] OTP for ${emailLower} is ${otp}`);
    }

    res.json({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const emailLower = email.toLowerCase();
    const record = otpStore.get(emailLower);

    if (!record) return res.status(400).json({ message: 'No OTP requested or expired' });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(emailLower);
      return res.status(400).json({ message: 'OTP has expired' });
    }
    if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    // Valid OTP, remove it
    otpStore.delete(emailLower);

    // Auto-register or login
    let user;
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [emailLower]);
    if (rows.length === 0) {
      // Auto register
      const { rows: newRows } = await db.query(
        "INSERT INTO users (name, email, role, phone, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, phone, email, role, addresses, created_at",
        [emailLower.split('@')[0], emailLower, 'customer', '', 'OTP_LOGIN']
      );
      user = newRows[0];
    } else {
      user = rows[0];
    }

    const token = generateToken(user.id);
    setCookie(res, token);
    
    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...safeUser } = user;
    res.json({ message: 'Login successful', user: safeUser });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, role, otp } = req.body;
    if (!name || !phone || !email || !password || !otp) return res.status(400).json({ message: 'All fields including OTP are required' });

    const emailLower = email.toLowerCase();
    
    // Check OTP
    const record = otpStore.get(emailLower);
    if (!record) return res.status(400).json({ message: 'No OTP requested or expired' });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(emailLower);
      return res.status(400).json({ message: 'OTP has expired' });
    }
    if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRole = role === 'admin' ? 'admin' : 'customer';

    const { rows } = await db.query(
      'INSERT INTO users (name, phone, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, phone, email, role, addresses, created_at',
      [name, phone, emailLower, passwordHash, userRole]
    );

    // Valid OTP, remove it
    otpStore.delete(emailLower);

    const token = generateToken(rows[0].id);
    setCookie(res, token);
    res.status(201).json({ message: 'Registration successful', user: rows[0] });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    if (!email || !password || !otp) return res.status(400).json({ message: 'Email, password, and OTP required' });

    const emailLower = email.toLowerCase();

    // Check OTP
    const record = otpStore.get(emailLower);
    if (!record) return res.status(400).json({ message: 'No OTP requested or expired' });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(emailLower);
      return res.status(400).json({ message: 'OTP has expired' });
    }
    if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [emailLower]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    // Valid OTP, remove it
    otpStore.delete(emailLower);

    const token = generateToken(user.id);
    setCookie(res, token);

    const { password_hash, ...safeUser } = user;
    res.json({ message: 'Login successful', user: safeUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};



exports.logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, addresses } = req.body;
    
    // Construct dynamic update query
    const updates = [];
    const params = [];
    let i = 1;

    if (name !== undefined) { updates.push(`name = $${i++}`); params.push(name); }
    if (phone !== undefined) { updates.push(`phone = $${i++}`); params.push(phone); }
    if (addresses !== undefined) { updates.push(`addresses = $${i++}`); params.push(JSON.stringify(addresses)); }

    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

    params.push(req.user.id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, name, phone, email, role, addresses, created_at`;
    
    const { rows } = await db.query(query, params);
    res.json({ message: 'Profile updated successfully', user: rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    });
    
    const payload = ticket.getPayload();
    const { name, email, picture } = payload;
    
    const emailLower = email.toLowerCase();

    // Check if user exists
    let userRes = await db.query('SELECT id, name, email, role, addresses FROM users WHERE email = $1', [emailLower]);
    
    let user;
    if (userRes.rows.length === 0) {
      // User doesn't exist, create a new one (Google Signup)
      const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
      
      const insertRes = await db.query(
        'INSERT INTO users (name, phone, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, addresses, created_at',
        [name, 'Google User', emailLower, randomPassword, 'customer']
      );
      user = insertRes.rows[0];
    } else {
      user = userRes.rows[0];
    }

    const token = generateToken(user.id);
    setCookie(res, token);
    
    res.json({
      message: 'Google login successful',
      token,
      user
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};
