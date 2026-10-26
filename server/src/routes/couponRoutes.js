import express from 'express';
import {
  getCoupons,
  getCouponStats,
  getCouponById,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  validateCoupon,
  redeemCoupon
} from '../controllers/couponController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public / Customer Checkout Endpoints
router.post('/validate', validateCoupon);
router.post('/redeem', redeemCoupon);

// Admin Management Endpoints
router.get('/stats', protect, requireAdmin, getCouponStats);
router.get('/', protect, requireAdmin, getCoupons);
router.get('/:id', protect, requireAdmin, getCouponById);
router.post('/', protect, requireAdmin, createCoupon);
router.put('/:id', protect, requireAdmin, updateCoupon);
router.patch('/:id/toggle', protect, requireAdmin, toggleCouponStatus);
router.delete('/:id', protect, requireAdmin, deleteCoupon);

export default router;
