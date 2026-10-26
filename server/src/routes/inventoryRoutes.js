import express from 'express';
import {
  getInventory,
  adjustStock,
  stockIn,
  stockOut,
  getTransactions
} from '../controllers/inventoryController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Read inventory
router.get('/', getInventory);
router.get('/transactions', protect, requireAdmin, getTransactions);

// Stock modification operations
router.post('/adjust', protect, requireAdmin, adjustStock);
router.post('/stock-in', protect, requireAdmin, stockIn);
router.post('/stock-out', protect, requireAdmin, stockOut);

export default router;
