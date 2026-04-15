import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  unit: {
    type: String,
    enum: ['per kg', 'per piece'],
    required: true
  },
  type: {
    type: String,
    enum: ['Global', 'Product-based'],
    required: true
  },
  basePrice: {
    type: Number,
    default: 0 // Only for Global services
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;
