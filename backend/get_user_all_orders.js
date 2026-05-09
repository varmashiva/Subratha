import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

import('./models/User.js').then(async ({ default: User }) => {
  const Order = (await import('./models/Order.js')).default;
  const user = await User.findOne({ email: 'shivavarama1@gmail.com' });
  const orders = await Order.find({ user: user._id });
  console.log(`Total orders for user: ${orders.length}`);
  orders.forEach(o => console.log(`- ${o._id} | ${o.status}`));
  process.exit(0);
});
