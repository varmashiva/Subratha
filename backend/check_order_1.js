import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

import('./models/Order.js').then(async ({ default: Order }) => {
  const o = await Order.findById('69fd4830a33818aee6943554');
  console.log("Order TotalAmount:", o.totalAmount);
  console.log("Items:");
  o.items.forEach(i => console.log(`  ${i.service} | ${i.product} | weight: ${i.weight} | price: ${i.price} | total: ${i.total}`));
  process.exit(0);
});
