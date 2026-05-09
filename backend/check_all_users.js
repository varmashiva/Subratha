import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

import('./models/User.js').then(async ({ default: User }) => {
  const users = await User.find({});
  console.log("All Users:");
  users.forEach(u => console.log(`- ${u.name} | ${u.email} | ID: ${u._id}`));
  process.exit(0);
});
