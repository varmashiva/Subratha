import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

import('./models/Subscription.js').then(async ({ default: Subscription }) => {
  const sub = await Subscription.findOne({ status: 'Active', service: 'Wash and dry' });
  if (sub) {
    console.log(`Found subscription. Current used: ${sub.used}`);
    if (sub.used < 0) {
       // It means the previous 25kg was never added.
       // It subtracted 5 because the order was edited from 25 to 20.
       // So the correct used is 20.
       sub.used = 20;
       await sub.save();
       console.log("Fixed used to 20");
    }
  } else {
    console.log("No active wash and dry sub found");
  }
  process.exit(0);
});
