import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Basic sanity check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', domain: 'Subratha', service: 'Laundry API' });
});

// Demo laundry services endpoint
app.get('/api/services', (req, res) => {
  const services = [
    { id: 1, name: 'Wash & Fold', description: 'Everyday laundry, perfectly cleaned and folded with professional care.' },
    { id: 2, name: 'Dry Cleaning', description: 'Expert stain removal and delicate fabric handling for your garments.' },
    { id: 3, name: 'Shoe Restoration', description: 'Comprehensive cleaning and restoration for your footwear.' }
  ];
  res.json(services);
});

app.listen(PORT, () => {
  console.log(`\x1b[35m[backend]\x1b[0m Server running at http://localhost:${PORT}`);
});
