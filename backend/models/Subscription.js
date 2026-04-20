import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  totalLimit: {
    type: Number,
    default: 25
  },
  used: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Expired'],
    default: 'Active'
  }
}, { timestamps: true });

// Auto-expire based on endDate
subscriptionSchema.pre('save', async function () {
  if (this.endDate && new Date() > this.endDate) {
    this.status = 'Expired';
  }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
