import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

import('./models/Order.js').then(async ({ default: Order }) => {
  const o = await Order.findById('69ff09c9ae958f6ee59c7f37');
  
  // Simulated request to complete order
  const response = await fetch(`http://localhost:5001/api/orders/69ff09c9ae958f6ee59c7f37`, {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
        // Note: auth is bypassed here if we use model directly, but we want to test the ROUTE logic
    },
    body: JSON.stringify({ status: 'Completed' })
  });
  
  process.exit(0);
});
