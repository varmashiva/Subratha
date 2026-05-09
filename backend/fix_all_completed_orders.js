import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

const MAP_TO_SUB_SERVICE = {
  'Wash & Fold': 'Wash and dry',
  'Wash&Fold': 'Wash and dry',
  'Wash & Iron': 'Wash and iron',
  'Wash&Iron': 'Wash and iron'
};

import('./models/Order.js').then(async ({ default: Order }) => {
  const Subscription = (await import('./models/Subscription.js')).default;
  const completedOrders = await Order.find({ status: 'Completed' }).sort({ createdAt: 1 });
  
  if (completedOrders.length === 0) {
      console.log("No completed orders found");
      process.exit(0);
  }
  
  console.log(`Found ${completedOrders.length} completed orders. Resetting subscription 'used' counts first...`);
  
  // 1. Reset all subscription usage to 0 so we can re-calculate from scratch
  await Subscription.updateMany({}, { $set: { used: 0 } });

  // 2. Process each completed order in chronological order to deduct from subscriptions
  for (const order of completedOrders) {
    console.log(`\nProcessing Order: ${order._id} (${order.createdAt})`);
    
    if (!order.subscriptionApplied) {
      console.log("  Skipping: No subscription applied to this order.");
      continue;
    }

    const activeSubs = await Subscription.find({ userId: order.user, status: 'Active' });
    
    // Group items by service
    const totals = {};
    for (const item of order.items) {
      const subService = MAP_TO_SUB_SERVICE[item.service] || item.service;
      if (!totals[subService]) totals[subService] = { weight: 0, qty: 0, items: [] };
      totals[subService].weight += (item.weight || 0);
      totals[subService].qty += (item.quantity || 0);
      totals[subService].items.push(item);
    }

    let orderKgDeducted = 0;
    let orderTotalAmount = 0;

    for (const [subService, data] of Object.entries(totals)) {
      const sub = activeSubs.find(s => s.service === subService);
      const isKgBased = data.weight > 0;
      const totalAmount = isKgBased ? data.weight : data.qty;
      
      let covered = 0;
      let overage = totalAmount;

      if (sub) {
        const remaining = Math.max(0, sub.totalLimit - sub.used);
        covered = Math.min(totalAmount, remaining);
        overage = Math.max(0, totalAmount - remaining);
        
        // Update subscription in DB immediately so next order sees current 'used'
        await Subscription.findByIdAndUpdate(sub._id, { $inc: { used: covered } });
        console.log(`  - Service ${subService}: Covered ${covered}, Overage ${overage} (Sub ID: ${sub._id})`);
        
        if (isKgBased) orderKgDeducted += covered;
      }

      // Update item totals in this service group
      let remainingLimitForItems = sub ? Math.max(0, sub.totalLimit - (sub.used - covered)) : 0;
      
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        if (isKgBased) {
          // Weight logic: only the first item in group carries overage price
          if (i === 0) item.total = overage * (item.price || 0);
          else item.total = 0;
        } else {
          // Quantity logic
          if (sub && remainingLimitForItems >= item.quantity) {
            remainingLimitForItems -= item.quantity;
            item.total = 0;
          } else if (sub && remainingLimitForItems > 0) {
            const chargeable = item.quantity - remainingLimitForItems;
            remainingLimitForItems = 0;
            item.total = chargeable * (item.price || 0);
          } else {
            item.total = item.quantity * (item.price || 0);
          }
        }
        orderTotalAmount += (item.total || 0);
      }
    }

    // Save recalculated order
    order.totalAmount = orderTotalAmount;
    order.subscriptionKgDeducted = orderKgDeducted;
    await order.save();
    console.log(`  -> Final Order Total: ₹${orderTotalAmount}, KG Deducted: ${orderKgDeducted}`);
  }
  
  console.log("\nFinished fixing all completed orders and subscription usage counts.");
  process.exit(0);
});
