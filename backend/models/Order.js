import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: String,
      required: true
    },
    service: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: false, // Made optional for kg-based services initially
      default: 1
    },
    unit: {
      type: String,
      enum: ['pcs', 'kg'],
      default: 'pcs'
    },
    price: {
      type: Number,
      required: false // Made optional for kg-based services initially
    },
    total: {
      type: Number,
      required: false // Made optional for kg-based services initially
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  address: {
    type: String,
    required: true
  },
  pickupTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'pending_weight', 'Confirmed', 'Picked', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  subscriptionApplied: {
    type: Boolean,
    default: false
  },
  subscriptionKgDeducted: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
