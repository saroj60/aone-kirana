import express from 'express';
import {
  getCustomers,
  getCustomerById,
  toggleCustomerStatus,
  createCustomer
} from '../controllers/customerController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Customer listing & details
router.get('/', protect, requireAdmin, getCustomers);
router.get('/:id', protect, requireAdmin, getCustomerById);
router.post('/', createCustomer);

// Admin customer state mutations
router.patch('/:id/status', protect, requireAdmin, toggleCustomerStatus);

export default router;
