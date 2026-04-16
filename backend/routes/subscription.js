import express from 'express';
import jwt from 'jsonwebtoken';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const router = express.Router();

// ─── Auth middleware ───────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = async (req, res, next) => {
  if (req.user?.role !== 'admin') {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

// ─── USER: Get my active subscription ─────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    // Auto-expire stale subscriptions
    await Subscription.updateMany(
      { userId: req.user.id, endDate: { $lt: new Date() }, status: 'Active' },
      { status: 'Expired' }
    );

    const sub = await Subscription.findOne({ userId: req.user.id, status: 'Active' });
    res.json({ subscription: sub || null });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subscription' });
  }
});

// ─── ADMIN: Get all subscriptions ─────────────────────────────────────────────
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    // Auto-expire stale subscriptions
    await Subscription.updateMany(
      { endDate: { $lt: new Date() }, status: 'Active' },
      { status: 'Expired' }
    );
    const subs = await Subscription.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subscriptions' });
  }
});

// ─── ADMIN: Get all users (for assign form) ────────────────────────────────────
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('name email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// ─── ADMIN: Assign subscription ───────────────────────────────────────────────
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { userId, plan, startDate, endDate, limitKg, usedKg, status } = req.body;

    const SERVICE_MAP = {
      'Wash & Fold': 'Wash and dry',
      'Wash & Iron': 'Wash and iron'
    };
    const PRICE_MAP = {
      'Wash & Fold': 1999,
      'Wash & Iron': 2499
    };

    // Deactivate any existing active sub for this user
    await Subscription.updateMany({ userId, status: 'Active' }, { status: 'Expired' });

    const sub = await Subscription.create({
      userId,
      plan,
      serviceType: SERVICE_MAP[plan],
      price: PRICE_MAP[plan],
      limitKg: limitKg || 25,
      usedKg: usedKg || 0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || 'Active'
    });

    res.status(201).json({ success: true, subscription: sub });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating subscription' });
  }
});

// ─── ADMIN: Update subscription ───────────────────────────────────────────────
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: 'Error updating subscription' });
  }
});

// ─── ADMIN: Reset usage ───────────────────────────────────────────────────────
router.patch('/:id/reset', protect, adminOnly, async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(req.params.id, { usedKg: 0 }, { new: true });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: 'Error resetting subscription usage' });
  }
});

// ─── ADMIN: Delete subscription ───────────────────────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Subscription.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting subscription' });
  }
});

export default router;
