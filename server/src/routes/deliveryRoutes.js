import express from 'express';
import {
  getDeliveryDashboard,
  getDeliveryPersons,
  createDeliveryPerson,
  updateDeliveryPerson,
  assignDeliveryPerson,
  updateDeliveryStatus,
  getDeliveryHistory,
  getDeliveryZones,
  updateDeliveryZone
} from '../controllers/deliveryController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Dashboard & Stats
router.get('/dashboard', protect, requireAdmin, getDeliveryDashboard);

// Riders Fleet
router.get('/riders', protect, requireAdmin, getDeliveryPersons);
router.post('/riders', protect, requireAdmin, createDeliveryPerson);
router.patch('/riders/:id', protect, requireAdmin, updateDeliveryPerson);

// Dispatch & Order Status
router.post('/assign', protect, requireAdmin, assignDeliveryPerson);
router.patch('/orders/:id/status', protect, requireAdmin, updateDeliveryStatus);

// History & Zones
router.get('/history', protect, requireAdmin, getDeliveryHistory);
router.get('/zones', protect, requireAdmin, getDeliveryZones);
router.put('/zones/:id', protect, requireAdmin, updateDeliveryZone);

export default router;
