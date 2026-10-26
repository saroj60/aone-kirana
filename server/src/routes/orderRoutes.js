import express from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  assignDeliveryPerson,
  updatePaymentStatus,
  evaluateStoreAssignment
} from '../controllers/orderController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Order creation & listing
router.post('/', createOrder);
router.post('/store-assignment', evaluateStoreAssignment);
router.get('/', getOrders);
router.get('/:id', getOrderById);

// Admin status mutations
router.patch('/:id/status', protect, requireAdmin, updateOrderStatus);
router.patch('/:id/assign-rider', protect, requireAdmin, assignDeliveryPerson);
router.patch('/:id/payment', protect, requireAdmin, updatePaymentStatus);

export default router;
