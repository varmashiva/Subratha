import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

import('./models/Subscription.js').then(async ({ default: Subscription }) => {
  const subs = await Subscription.find({ userId: '69df7023add402c9d134b35e' });
  console.log(JSON.stringify(subs, null, 2));
  process.exit(0);
});
