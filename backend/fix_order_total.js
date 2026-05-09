import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

import('./models/Order.js').then(async ({ default: Order }) => {
  const Subscription = (await import('./models/Subscription.js')).default;
  const originalOrder = await Order.findOne({ status: 'Completed' });
  
  if (!originalOrder) {
      console.log("No completed order found");
      process.exit(0);
  }
  
  console.log("Fixing order:", originalOrder._id);
  
  const activeSubscriptions = await Subscription.find({ userId: originalOrder.user, status: 'Active' });
  
  const MAP_TO_SUB_SERVICE = {
    'Wash & Fold': 'Wash and dry',
    'Wash&Fold': 'Wash and dry',
    'Wash & Iron': 'Wash and iron',
    'Wash&Iron': 'Wash and iron'
  };

  const newTotals = {};
  for (const item of originalOrder.items) {
    const subService = MAP_TO_SUB_SERVICE[item.service] || item.service;
    if (!newTotals[subService]) newTotals[subService] = { weight: 0, qty: 0, items: [] };
    newTotals[subService].weight += (item.weight || 0);
    newTotals[subService].qty += (item.quantity || 0);
    newTotals[subService].items.push(item);
  }

  let newTotalAmount = 0;
  let newSubscriptionKgDeducted = 0;
  const finalUpdatedItems = [];

  for (const [subService, data] of Object.entries(newTotals)) {
    const sub = originalOrder.subscriptionApplied 
      ? activeSubscriptions.find(s => s.service === subService) 
      : null;

    const isKgBased = data.weight > 0;
    const totalAmountToDeduct = isKgBased ? data.weight : data.qty;
    
    let overage = totalAmountToDeduct;
    let covered = 0;

    let trueRemainingLimit = 0;
    if (sub) {
      // Since order is ALREADY completed, the sub.used already includes this order's weight.
      // So the limit before this order was sub.totalLimit - sub.used + data.weight
      trueRemainingLimit = sub.totalLimit - sub.used + totalAmountToDeduct;
      
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
           itemTotal = overage * item.price;
        }
      } else {
        if (sub) {
          if (remainingLimitForPcs >= item.quantity) {
            remainingLimitForPcs -= item.quantity;
            itemTotal = 0;
          } else if (remainingLimitForPcs > 0) {
            const chargeableQty = item.quantity - remainingLimitForPcs;
            remainingLimitForPcs = 0;
            itemTotal = chargeableQty * item.price;
          } else {
            itemTotal = item.quantity * item.price;
          }
        } else {
          itemTotal = item.quantity * item.price;
        }
      }

      item.total = itemTotal;
      newTotalAmount += itemTotal;
      finalUpdatedItems.push(item);
    }
  }

  originalOrder.items = originalOrder.items.map(orig => 
    finalUpdatedItems.find(f => f._id.toString() === orig._id.toString())
  );
  originalOrder.totalAmount = newTotalAmount;
  if (originalOrder.subscriptionApplied) {
    originalOrder.subscriptionKgDeducted = newSubscriptionKgDeducted;
  }

  await originalOrder.save();
  console.log("Order saved with new totalAmount:", newTotalAmount);
  
  process.exit(0);
});
