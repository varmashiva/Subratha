import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

import('./models/Order.js').then(async ({ default: Order }) => {
  const o = await Order.findById('69ff09c9ae958f6ee59c7f37');
  console.log(JSON.stringify(o, null, 2));
  process.exit(0);
});
