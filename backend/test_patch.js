import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.o87c9.mongodb.net/test?retryWrites=true&w=majority');

import('./models/Order.js').then(async ({ default: Order }) => {
  const originalOrder = await Order.findOne({ status: 'Completed' });
  console.log("Found order:", originalOrder._id);
  
  const status = undefined;
  const updateFields = { items: originalOrder.items };

  try {
      const currentStatus = status || originalOrder.status;
      const wasCompleted = (originalOrder.status || '').toLowerCase() === 'completed';
      const isNowCompleted = (currentStatus || '').toLowerCase() === 'completed';

      if (originalOrder.subscriptionApplied) {
        const currentItems = updateFields.items || originalOrder.items;
        
        const MAP_TO_SUB_SERVICE = {
          'Wash & Fold': 'Wash and dry',
          'Wash&Fold': 'Wash and dry',
          'Wash & Iron': 'Wash and iron',
          'Wash&Iron': 'Wash and iron'
        };

        const newTotals = {};
        for (const item of currentItems) {
          const subService = MAP_TO_SUB_SERVICE[item.service] || item.service;
          if (!newTotals[subService]) newTotals[subService] = { weight: 0, qty: 0 };
          newTotals[subService].weight += (item.weight || 0);
          newTotals[subService].qty += (item.quantity || 0);
        }

        const oldTotals = {};
        if (wasCompleted) {
          for (const item of originalOrder.items) {
            const subService = MAP_TO_SUB_SERVICE[item.service] || item.service;
            if (!oldTotals[subService]) oldTotals[subService] = { weight: 0, qty: 0 };
            oldTotals[subService].weight += (item.weight || 0);
            oldTotals[subService].qty += (item.quantity || 0);
          }
        }

        const diffByService = {};

        for (const subService of Object.keys(newTotals)) {
          const newDeduction = isNowCompleted 
            ? (newTotals[subService].weight > 0 ? newTotals[subService].weight : newTotals[subService].qty) 
            : 0;
          
          let oldDeduction = 0;
          if (wasCompleted && oldTotals[subService]) {
            oldDeduction = oldTotals[subService].weight > 0 ? oldTotals[subService].weight : oldTotals[subService].qty;
          }

          const diff = newDeduction - oldDeduction;
          if (diff !== 0) {
            diffByService[subService] = (diffByService[subService] || 0) + diff;
          }
        }
        console.log("diffByService:", diffByService);
      }
      console.log("Success");
  } catch (err) {
      console.error("Error:", err);
  }
  process.exit(0);
});
