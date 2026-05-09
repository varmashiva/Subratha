import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create new order
router.post('/', protect, async (req, res) => {
  try {
    const { items, totalAmount, address, contactNumber, time, subscriptionApplied, subscriptionKgDeducted } = req.body;
    
    const newOrder = new Order({
      user: req.user._id,
      items,
      totalAmount,
      address,
      contactNumber,
      pickupTime: time,
      subscriptionApplied,
      subscriptionKgDeducted
    });

    const savedOrder = await newOrder.save();
    
    // Clear user's draftOrder after successful placement
    await User.findByIdAndUpdate(req.user._id, { $set: { draftOrder: [] } });

    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Get user orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Admin: Get all orders
router.get('/all', protect, async (req, res) => {
  // Check if user is admin
  const user = await User.findById(req.user._id);
  if (user.email !== 'shivavarma336@gmail.com') { // Hardcoded admin check for now
    // Allow shivavarma336 to see orders
    if (user.email !== 'shivavarama1@gmail.com') { 
       return res.status(403).json({ message: 'Not authorized as admin' });
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

    const originalOrder = await Order.findById(req.params.id);
    if (!originalOrder) return res.status(404).json({ message: 'Order not found' });

    if (items && items.length) {
      const currentItems = originalOrder.items.map(item => {
        const update = items.find(i => i._id.toString() === item._id.toString());
        const newQty = update?.quantity !== undefined ? update.quantity : item.quantity;
        const newWeight = update?.weight !== undefined ? update.weight : (item.weight || 0);
        const newPrice = update?.price !== undefined ? update.price : item.price;
        return { ...item.toObject(), quantity: newQty, weight: newWeight, price: newPrice };
      });

      const Subscription = (await import('../models/Subscription.js')).default;
      const activeSubscriptions = await Subscription.find({ userId: originalOrder.user, status: 'Active' });

      const MAP_TO_SUB_SERVICE = {
        'Wash & Fold': 'Wash and dry',
        'Wash&Fold': 'Wash and dry',
        'Wash & Iron': 'Wash and iron',
        'Wash&Iron': 'Wash and iron'
      };

      const wasCompleted = (originalOrder.status || '').toLowerCase() === 'completed';
      
      const newTotals = {};
      for (const item of currentItems) {
        const subService = MAP_TO_SUB_SERVICE[item.service] || item.service;
        if (!newTotals[subService]) newTotals[subService] = { weight: 0, qty: 0, items: [] };
        newTotals[subService].weight += (item.weight || 0);
        newTotals[subService].qty += (item.quantity || 0);
        newTotals[subService].items.push(item);
      }

      const oldTotals = {};
      if (wasCompleted) {
        for (const item of originalOrder.items) {
          const subService = MAP_TO_SUB_SERVICE[item.service] || item.service;
          if (!oldTotals[subService]) oldTotals[subService] = { weight: 0, qty: 0 };
          oldTotals[subService].weight += (item.weight || 0);
          oldTotals[subService].qty += (item.quantity || 0);
        }
      }

      let newTotalAmount = 0;
      let newSubscriptionKgDeducted = 0;
      const finalUpdatedItems = [];

      for (const [subService, data] of Object.entries(newTotals)) {
        const sub = activeSubscriptions.find(s => s.service === subService);

        const isKgBased = data.weight > 0;
        const totalAmountToDeduct = isKgBased ? data.weight : data.qty;
        
        let overage = totalAmountToDeduct;
        let covered = 0;

        let trueRemainingLimit = 0;
        if (sub) {
          const oldDeduction = (wasCompleted && oldTotals[subService]) 
            ? (oldTotals[subService].weight > 0 ? oldTotals[subService].weight : oldTotals[subService].qty) 
            : 0;
          trueRemainingLimit = sub.totalLimit - sub.used + oldDeduction;
          
          covered = Math.min(totalAmountToDeduct, trueRemainingLimit);
          overage = Math.max(0, totalAmountToDeduct - trueRemainingLimit);
          if (isKgBased) {
            newSubscriptionKgDeducted += covered;
          }
        }

        let remainingLimitForPcs = trueRemainingLimit;

        for (let i = 0; i < data.items.length; i++) {
          const item = data.items[i];
          let itemTotal = 0;
          
          if (isKgBased) {
            if (i === 0) {
               itemTotal = overage * (item.price || 0);
            }
          } else {
            if (sub) {
              if (remainingLimitForPcs >= item.quantity) {
                remainingLimitForPcs -= item.quantity;
                itemTotal = 0;
              } else if (remainingLimitForPcs > 0) {
                const chargeableQty = item.quantity - remainingLimitForPcs;
                remainingLimitForPcs = 0;
                itemTotal = chargeableQty * (item.price || 0);
              } else {
                itemTotal = (item.quantity || 0) * (item.price || 0);
              }
            } else {
              itemTotal = (item.quantity || 0) * (item.price || 0);
            }
          }

          item.total = itemTotal;
          item.subscriptionApplied = sub && (totalAmountToDeduct - overage) > 0;
          newTotalAmount += itemTotal;
          finalUpdatedItems.push(item);
        }
      }

      updateFields.items = originalOrder.items.map(orig => 
        finalUpdatedItems.find(f => f._id.toString() === orig._id.toString())
      );
      updateFields.totalAmount = newTotalAmount;
      updateFields.subscriptionApplied = newSubscriptionKgDeducted > 0 || finalUpdatedItems.some(i => i.subscriptionApplied && i.total === 0);
      updateFields.subscriptionKgDeducted = newSubscriptionKgDeducted;

      if (originalOrder.status === 'pending_weight') {
        const allWeightsFilled = updateFields.items.every(item => item.unit !== 'kg' || item.weight > 0);
        if (allWeightsFilled && !status) {
          updateFields.status = 'Pending';
        }
      }
    }

    const currentStatus = status || originalOrder.status;
    const wasCompleted = (originalOrder.status || '').toLowerCase() === 'completed';
    const isNowCompleted = (currentStatus || '').toLowerCase() === 'completed';

    if (originalOrder.subscriptionApplied || updateFields.subscriptionApplied) {
      const Subscription = (await import('../models/Subscription.js')).default;
      const currentItems = updateFields.items || originalOrder.items;
      
      const MAP_TO_SUB_SERVICE = {
        'Wash & Fold': 'Wash and dry',
        'Wash&Fold': 'Wash and dry',
        'Wash & Iron': 'Wash and iron',
        'Wash&Iron': 'Wash and iron'
      };

      const newTotals = {};
      for (const item of currentItems) {
        const subService = MAP_TO_SUB_SERVICE[item.service] || item.service;
        if (!newTotals[subService]) newTotals[subService] = { weight: 0, qty: 0 };
        newTotals[subService].weight += (item.weight || 0);
        newTotals[subService].qty += (item.quantity || 0);
      }

      const oldTotals = {};
      if (wasCompleted) {
        for (const item of originalOrder.items) {
          const subService = MAP_TO_SUB_SERVICE[item.service] || item.service;
          if (!oldTotals[subService]) oldTotals[subService] = { weight: 0, qty: 0 };
          oldTotals[subService].weight += (item.weight || 0);
          oldTotals[subService].qty += (item.quantity || 0);
        }
      }

      const diffByService = {};

      for (const subService of Object.keys(newTotals)) {
        // Only deduct if the service actually has a matching subscription
        const sub = await Subscription.findOne({ userId: originalOrder.user, status: 'Active', service: subService });
        if (!sub) continue;

        const newDeduction = isNowCompleted 
          ? (newTotals[subService].weight > 0 ? newTotals[subService].weight : newTotals[subService].qty) 
          : 0;
        
        let oldDeduction = 0;
        if (wasCompleted && oldTotals[subService]) {
          oldDeduction = oldTotals[subService].weight > 0 ? oldTotals[subService].weight : oldTotals[subService].qty;
        }

        const diff = newDeduction - oldDeduction;
        if (diff !== 0) {
          diffByService[subService] = (diffByService[subService] || 0) + diff;
        }
      }

      for (const [subService, diff] of Object.entries(diffByService)) {
        await Subscription.findOneAndUpdate(
          { userId: originalOrder.user, status: 'Active', service: subService },
          { $inc: { used: diff } }
        );
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
