import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  services: [{
    name: {
      type: String, // e.g., 'Wash & Fold', 'Dry Clean'
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
