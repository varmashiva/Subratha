import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

import('./models/User.js').then(async ({ default: User }) => {
  const Subscription = (await import('./models/Subscription.js')).default;
  const Order = (await import('./models/Order.js')).default;
  
  const user = await User.findOne({ email: 'shivavarma1@gmail.com' });
  if (!user) {
    console.log("User not found");
    process.exit(0);
  }
  console.log("User ID:", user._id);
  
  const subs = await Subscription.find({ userId: user._id });
  console.log("Subscriptions:");
  for (const sub of subs) {
    console.log(`- ${sub.service}: ${sub.used} / ${sub.totalLimit} ${sub.unit} (Status: ${sub.status})`);
  }
  
  const orders = await Order.find({ user: user._id }).sort({ createdAt: 1 });
  console.log("\nOrders:");
  for (const o of orders) {
    console.log(`\nOrder ID: ${o._id} | Status: ${o.status} | Total Amount: ₹${o.totalAmount} | subKgDeducted: ${o.subscriptionKgDeducted} | subApplied: ${o.subscriptionApplied}`);
    let totalWeight = 0;
    for (const item of o.items) {
      if (item.unit === 'kg') {
        totalWeight += (item.weight || 0);
      }
      console.log(`  - ${item.service} | ${item.product}: ${item.quantity} ${item.unit} @ ₹${item.price} (weight: ${item.weight || 0}kg) -> Total: ₹${item.total}`);
    }
    console.log(`  -> Order Total KG: ${totalWeight}`);
  }
  
  process.exit(0);
});
