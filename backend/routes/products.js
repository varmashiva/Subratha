import express from 'express';
import Product from '../models/Product.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to protect routes (duplicated from order.js for now, could be in a separate utils file)
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin only' });
  }
};

let productCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Public: Get all products
router.get('/', async (req, res) => {
  try {
    if (productCache && (Date.now() - lastCacheUpdate < CACHE_DURATION)) {
      return res.json(productCache);
    }
    const products = await Product.find().sort({ category: 1, name: 1 });
    productCache = products;
    lastCacheUpdate = Date.now();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Admin: Add a new product
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { name, category, services, imageUrl } = req.body;
    const product = await Product.create({ name, category, services, imageUrl });
    productCache = null; // Invalidate cache
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Admin: Update a product
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    productCache = null; // Invalidate cache
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Admin: Delete a product
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    productCache = null; // Invalidate cache
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});


export default router;
