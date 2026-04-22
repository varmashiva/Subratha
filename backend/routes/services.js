import express from 'express';
import Service from '../models/Service.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

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

let serviceCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Public: Get all services
router.get('/', async (req, res) => {
  try {
    if (serviceCache && (Date.now() - lastCacheUpdate < CACHE_DURATION)) {
      return res.json(serviceCache);
    }
    const services = await Service.find().sort({ name: 1 });
    serviceCache = services;
    lastCacheUpdate = Date.now();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services' });
  }
});

// Admin: Add a new service
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    serviceCache = null; // Invalidate cache
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error creating service' });
  }
});

// Admin: Update a service
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    serviceCache = null; // Invalidate cache
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error updating service' });
  }
});

// Admin: Delete a service
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    serviceCache = null; // Invalidate cache
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service' });
  }
});


export default router;
