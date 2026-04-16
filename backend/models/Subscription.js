import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['Wash & Fold', 'Wash & Iron'],
    required: true
  },
  serviceType: {
    type: String,
    required: true
    // 'Wash & Fold' maps to 'Wash and dry'
    // 'Wash & Iron' maps to 'Wash and iron'
  },
  price: {
    type: Number,
    required: true
  },
  limitKg: {
    type: Number,
    default: 25
  },
  usedKg: {
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
subscriptionSchema.pre('save', function (next) {
  if (this.endDate && new Date() > this.endDate) {
    this.status = 'Expired';
  }
  next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
