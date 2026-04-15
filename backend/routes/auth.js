import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Generate and send token in cookie and redirection
const sendToken = (user, res) => {
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Set as cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax',
  });

  const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://subratha.com' : 'http://localhost:5173');
  // Redirect back to frontend with a flag
  res.redirect(`${frontendUrl}/?auth_success=true`);
};

// Initial Google OAuth route
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route
router.get(
  '/google/callback',
  (req, res, next) => {
    const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://subratha.com' : 'http://localhost:5173');
    passport.authenticate('google', { failureRedirect: `${frontendUrl}/login?error=auth_failed`, session: false })(req, res, next);
  },
  (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://subratha.com' : 'http://localhost:5173');
    // On success
    if (req.user) {
      sendToken(req.user, res);
    } else {
      res.redirect(`${frontendUrl}/login?error=no_user`);
    }
  }
);

// Get current user info from cookie
router.get('/me', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-googleId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

export default router;
