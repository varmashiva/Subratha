import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

import('./models/Order.js').then(async ({ default: Order }) => {
  const Subscription = (await import('./models/Subscription.js')).default;
  const o = await Order.findById('69ff09c9ae958f6ee59c7f37');
  
  // This is what the PATCH route does
  const currentStatus = 'Completed';
  const originalStatus = o.status;
  
  const MAP_TO_SUB_SERVICE = {
    'Wash & Fold': 'Wash and dry',
    'Wash&Fold': 'Wash and dry',
    'Wash & Iron': 'Wash and iron',
    'Wash&Iron': 'Wash and iron'
  };

  const newTotals = {};
  for (const item of o.items) {
    const subService = MAP_TO_SUB_SERVICE[item.service] || item.service;
    if (!newTotals[subService]) newTotals[subService] = { weight: 0, qty: 0 };
    newTotals[subService].weight += (item.weight || 0);
    newTotals[subService].qty += (item.quantity || 0);
  }

  for (const [subService, data] of Object.entries(newTotals)) {
    const sub = await Subscription.findOne({ userId: o.user, status: 'Active', service: subService });
    if (!sub) continue;

    const newDeduction = (data.weight > 0 ? data.weight : data.qty);
    console.log(`Deducting ${newDeduction} from ${subService}`);
    await Subscription.findByIdAndUpdate(sub._id, { $inc: { used: newDeduction } });
  }

  o.status = 'Completed';
  await o.save();
  console.log("Order 69FF09C9 marked as Completed and subscription updated.");
  process.exit(0);
});
