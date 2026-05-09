import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

import('./models/Order.js').then(async ({ default: Order }) => {
  const o = await Order.findById('69ff09c9ae958f6ee59c7f37');
  o.items[0].weight = 5;
  o.items[3].weight = 5;
  await o.save();
  console.log("Order updated weights to 5kg each");
  process.exit(0);
});
