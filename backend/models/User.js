import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  picture: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  draftOrder: {
    cart: { type: Array, default: [] },
    selectionQuantities: { type: Object, default: {} },
    selectedServiceIds: { type: Array, default: [] },
    orderStep: { type: Number, default: 1 },
    orderDetails: { type: Object, default: { address: '', time: '', service: '' } }
  }
});

const User = mongoose.model('User', userSchema);
export default User;
