import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import './config/passport.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/order.js';
import productRoutes from './routes/products.js';
import serviceRoutes from './routes/services.js';
import subscriptionRoutes from './routes/subscription.js';
import Product from './models/Product.js';
import Service from './models/Service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://subratha.com',
  'https://www.subratha.com',
  'https://subratha.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Basic sanity check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', domain: 'Subratha', service: 'Laundry API' });
});



// Seed data if none exists
const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const demoProducts = [
        {
          name: 'Shirt',
          category: 'Top Wear',
          services: [
            { name: 'Wash and dry', price: 40 },
            { name: 'Wash and iron', price: 60 },
            { name: 'Wash and steam iron', price: 80 },
            { name: 'Dry clean', price: 120 }
          ]
        },
        {
          name: 'Trousers',
          category: 'Bottom Wear',
          services: [
            { name: 'Wash and dry', price: 50 },
            { name: 'Wash and iron', price: 70 },
            { name: 'Wash and steam iron', price: 90 },
            { name: 'Dry clean', price: 150 }
          ]
        },
        {
          name: 'Saree',
          category: 'Ethnic Wear',
          services: [
            { name: 'Wash and dry', price: 100 },
            { name: 'Wash and iron', price: 150 },
            { name: 'Wash and steam iron', price: 200 },
            { name: 'Dry clean', price: 350 }
          ]
        },
        {
          name: 'Bed Sheet (Double)',
          category: 'Home Linen',
          services: [
            { name: 'Wash and dry', price: 120 },
            { name: 'Wash and iron', price: 180 },
            { name: 'Wash and steam iron', price: 250 },
            { name: 'Dry clean', price: 450 }
          ]
        }
      ];
      await Product.insertMany(demoProducts);
      console.log('🌱 Seeded demo products');
    }
  } catch (err) {
    console.error('Error seeding products:', err);
  }
};
seedProducts();

const seedServices = async () => {
  try {
    const count = await Service.countDocuments();
    if (count === 0) {
      const demoServices = [
        { name: 'Wash and dry', unit: 'per kg', type: 'Global', basePrice: 60 },
        { name: 'Wash and iron', unit: 'per kg', type: 'Global', basePrice: 80 },
        { name: 'Wash and steam iron', unit: 'per kg', type: 'Global', basePrice: 120 },
        { name: 'Dry clean', unit: 'per piece', type: 'Product-based' }
      ];
      await Service.insertMany(demoServices);
      console.log('🌱 Seeded demo services');
    }
  } catch (err) {
    console.error('Error seeding services:', err);
  }
};
seedServices();

app.listen(PORT, () => {
  console.log(`\x1b[35m[backend]\x1b[0m Server running at http://localhost:${PORT}`);
});
