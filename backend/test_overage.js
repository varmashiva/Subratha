import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

import('./models/Order.js').then(async ({ default: Order }) => {
  const Subscription = (await import('./models/Subscription.js')).default;

  const originalOrder = await Order.findOne({ status: 'Completed' });
  console.log("Found order:", originalOrder._id);

  const MAP_TO_SUB_SERVICE = {
    'Wash & Fold': 'Wash and dry',
    'Wash&Fold': 'Wash and dry',
    'Wash & Iron': 'Wash and iron',
    'Wash&Iron': 'Wash and iron'
  };

  const activeSubscriptions = await Subscription.find({ userId: originalOrder.user, status: 'Active' });
  console.log("Active Subscriptions:", activeSubscriptions.map(s => ({ service: s.service, remaining: s.totalLimit - s.used })));

  // Mock incoming items (e.g. from Admin Dashboard)
  const items = [
    { _id: originalOrder.items[0]._id, weight: 26, price: 100 }
  ];

  let newTotalAmount = 0;
  let newSubscriptionKgDeducted = 0; // order-level

  // 1. Prepare current items
  const currentItems = originalOrder.items.map(item => {
    const update = items.find(i => i._id.toString() === item._id.toString());
    const newQty = update?.quantity !== undefined ? update.quantity : item.quantity;
    const newWeight = update?.weight !== undefined ? update.weight : (item.weight || 0);
    const newPrice = update?.price !== undefined ? update.price : item.price;
    return { ...item.toObject(), quantity: newQty, weight: newWeight, price: newPrice };
  });

  // 2. Group by service
  const serviceTotals = {};
  for (const item of currentItems) {
    if (!serviceTotals[item.service]) {
      serviceTotals[item.service] = { weight: 0, qty: 0, items: [] };
    }
    serviceTotals[item.service].weight += item.weight;
    serviceTotals[item.service].qty += item.quantity;
    serviceTotals[item.service].items.push(item);
  }

  // 3. Process each service group
  const finalUpdatedItems = [];
  
  for (const [serviceName, data] of Object.entries(serviceTotals)) {
    const subService = MAP_TO_SUB_SERVICE[serviceName] || serviceName;
    const sub = originalOrder.subscriptionApplied 
        ? activeSubscriptions.find(s => s.service === subService) 
        : null;

    let remainingLimit = 0;
    if (sub) {
        // We calculate remaining limit based on what the subscription has NOW.
        // BUT wait! If the order was ALREADY completed, the subscription usage ALREADY INCLUDES this order's deduction!
        // We shouldn't use the current limit blindly if we want to know what it was before.
        // However, AdminDashboard only computes it from `totalLimit - used`.
        remainingLimit = sub.totalLimit - sub.used;
    }

    const isKgBased = data.weight > 0;
    const totalAmountToDeduct = isKgBased ? data.weight : data.qty;
    
    let overage = totalAmountToDeduct;
    let covered = 0;

    if (sub) {
        covered = Math.min(totalAmountToDeduct, remainingLimit);
        overage = Math.max(0, totalAmountToDeduct - remainingLimit);
        newSubscriptionKgDeducted += covered;
    }

    // Now assign the total to items
    // For kg-based (Global), the first item gets all the weight and the total charge.
    // For pcs-based, we can just assign it to the first item or distribute it.
    for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        let itemTotal = 0;
        
        if (i === 0) {
            itemTotal = overage * item.price;
        }

        item.total = itemTotal;
        newTotalAmount += itemTotal;
        finalUpdatedItems.push(item);
    }
  }

  console.log("New Total Amount:", newTotalAmount);
  console.log("New Subscription Deducted:", newSubscriptionKgDeducted);
  console.log("Final Items:");
  finalUpdatedItems.forEach(i => console.log(`${i.product}: W=${i.weight}, P=${i.price}, Tot=${i.total}`));

  process.exit(0);
});
