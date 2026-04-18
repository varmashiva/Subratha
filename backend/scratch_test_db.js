import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subscription from './models/Subscription.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function test() {
  try {
    console.log('Connecting to:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    // Test a simple find to see if collection is accessible
    const count = await Subscription.countDocuments();
    console.log('Current subscription count:', count);

    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
}

test();
