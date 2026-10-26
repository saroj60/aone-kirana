import express from 'express';
import {
  getDashboardStats,
  getSalesAnalytics,
  updateProductStock,
  updateOrderStatus
} from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// In production, uncomment protect and requireAdmin to enforce JWT:
// router.use(protect, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/sales', getSalesAnalytics);
router.patch('/products/:id/stock', updateProductStock);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;
