import express from 'express';
import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

const router = express.Router();

// Middleware to protect routes
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create a new order
router.post('/', protect, async (req, res) => {
  try {
    const { items, address, time, totalAmount, subscriptionApplied, subscriptionKgDeducted } = req.body;

    if (!items || !items.length || !address || !time) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // If subscription was applied on the frontend, deduct kg from subscription
    if (subscriptionApplied && subscriptionKgDeducted > 0) {
      await Subscription.findOneAndUpdate(
        { userId: req.user.id, status: 'Active' },
        { $inc: { usedKg: subscriptionKgDeducted } }
      );
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      address,
      pickupTime: time,
      totalAmount,
      subscriptionApplied: subscriptionApplied || false,
      subscriptionKgDeducted: subscriptionKgDeducted || 0
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Get user's orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Admin: Get all orders
router.get('/all', protect, async (req, res) => {
  // Simple check for admin role
  if (req.user.role !== 'admin') {
    // We need to fetch the actual user record to verify role if it wasn't in JWT
    // But since we updated passport to include it, let's trust it or verify
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
  }

  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all orders' });
  }
});

// Admin: Update order status
router.patch('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order' });
  }
});

export default router;
