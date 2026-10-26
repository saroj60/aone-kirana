import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import { registerSseClient, broadcastRealtimeEvent } from './services/realtimeService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/offers', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingRoutes);

// Realtime Live Stream endpoint for WebSockets / Server-Sent Events (SSE)
// Feeds Customer App, Store Dashboard, and Rider App
app.get('/api/notifications/stream', registerSseClient);
app.post('/api/notifications/broadcast', (req, res) => {
  const { eventType, payload, filter } = req.body;
  broadcastRealtimeEvent(eventType || 'NOTIFICATION', payload || {}, filter || {});
  res.json({ success: true, message: 'Broadcast sent' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Aone Kirana Grocery Backend',
    timestamp: new Date().toISOString()
  });
});

// Location reverse-geocoding endpoint using OpenStreetMap Nominatim
app.get('/api/location/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&accept-language=en`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AoneKiranaGrocery/1.0 (contact@aonekirana.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`OSM Nominatim returned status ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    const road = addr.road || '';
    const neighborhood = addr.suburb || addr.neighbourhood || addr.village || addr.quarter || addr.hamlet || '';
    const municipality = addr.municipality || addr.city_district || addr.town || addr.city || '';
    const district = addr.county || 'Lalitpur';
    const landmark = addr.amenity || addr.building || addr.shop || '';

    const parts = [road, neighborhood, municipality, district].filter(Boolean);
    // Filter duplicates while preserving order
    const uniqueParts = parts.filter((part, idx) => 
      parts.findIndex(p => p.toLowerCase().trim() === part.toLowerCase().trim()) === idx
    );

    let formatted = uniqueParts.join(', ');
    if (!formatted) {
      formatted = data.display_name?.split(',').slice(0, 3).join(', ') || 'Tikathali, Lalitpur';
    }

    return res.json({
      success: true,
      address: formatted,
      landmark: landmark,
      displayName: data.display_name,
      details: addr
    });
  } catch (err) {
    console.warn('Reverse geocode proxy error:', err.message);
    return res.json({
      success: false,
      address: 'Lalitpur, Nepal',
      message: err.message
    });
  }
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aone_kirana';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected successfully to:', MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Aone Kirana Express REST API Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.warn('MongoDB connection failed or skipped. Starting Express in mock-ready mode on port', PORT);
    app.listen(PORT, () => {
      console.log(`Server running in development mode on port ${PORT}`);
    });
  });
