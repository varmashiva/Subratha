import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

import('./models/Order.js').then(async ({ default: Order }) => {
  import('./models/Subscription.js').then(async ({ default: Subscription }) => {
    const orders = await Order.find().sort({createdAt:-1}).limit(3);
    console.log("RECENT ORDERS:");
    for (let o of orders) {
      console.log(`ID: ${o._id}, status: ${o.status}, subApplied: ${o.subscriptionApplied}`);
      console.log(`Items:`, JSON.stringify(o.items, null, 2));
    }
    const subs = await Subscription.find();
    console.log("\nSUBSCRIPTIONS:");
    console.log(JSON.stringify(subs, null, 2));
    process.exit(0);
  });
});
