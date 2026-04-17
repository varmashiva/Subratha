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

    // Check if any item is KG-based and missing weight
    const isPendingWeight = items.some(item => item.unit === 'kg' && (item.quantity === null || item.quantity === 0));

    // If subscription was applied on the frontend, deduct kg ONLY if weight is known
    // If weight is pending, we'll deduct it when the weight is updated by admin
    if (subscriptionApplied && subscriptionKgDeducted > 0 && !isPendingWeight) {
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
      totalAmount: isPendingWeight ? 0 : totalAmount,
      status: isPendingWeight ? 'pending_weight' : 'Pending',
      subscriptionApplied: subscriptionApplied || false,
      subscriptionKgDeducted: isPendingWeight ? 0 : (subscriptionKgDeducted || 0)
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

// Admin: Update order status or details (weight)
router.patch('/:id', protect, async (req, res) => {
  try {
    const { status, items } = req.body;
    let updateFields = {};
    if (status) updateFields.status = status;

    if (items && items.length) {
      // Find the original order to check for subscription
      const originalOrder = await Order.findById(req.params.id);
      if (!originalOrder) return res.status(404).json({ message: 'Order not found' });

      // Calculate new totals for items and the whole order
      let newTotalAmount = 0;
      let newSubscriptionKgDeducted = 0;

      const updatedItems = originalOrder.items.map(item => {
        const update = items.find(i => i._id.toString() === item._id.toString());
        if (update) {
          const newQty = update.quantity;
          const newTotal = item.price * newQty;
          
          if (item.unit === 'kg' && originalOrder.subscriptionApplied) {
            newSubscriptionKgDeducted += newQty;
          }

          newTotalAmount += newTotal;
          return { ...item.toObject(), quantity: newQty, total: newTotal };
        }
        newTotalAmount += item.total || 0;
        if (item.unit === 'kg' && originalOrder.subscriptionApplied) {
          newSubscriptionKgDeducted += item.quantity || 0;
        }
        return item;
      });

      updateFields.items = updatedItems;
      updateFields.totalAmount = newTotalAmount;

      // Handle subscription deduction if it was pending and we now have weights
      if (originalOrder.status === 'pending_weight' && originalOrder.subscriptionApplied && newSubscriptionKgDeducted > 0) {
        await Subscription.findOneAndUpdate(
          { userId: originalOrder.user, status: 'Active' },
          { $inc: { usedKg: newSubscriptionKgDeducted } }
        );
        updateFields.subscriptionKgDeducted = newSubscriptionKgDeducted;
      }
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(order);
  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({ message: 'Error updating order' });
  }
});

export default router;
