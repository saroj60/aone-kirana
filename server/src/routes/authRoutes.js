import express from 'express';
import {
  adminLogin,
  getAdminProfile,
  customerRegister,
  customerLogin,
  getCustomerProfile,
  updateCustomerProfile
} from '../controllers/authController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Customer Authentication Endpoints (Register with Name & Number)
router.post('/customer/register', customerRegister);
router.post('/customer/login', customerLogin);
router.get('/customer/me', protect, getCustomerProfile);
router.put('/customer/profile', protect, updateCustomerProfile);

// Admin Authentication Endpoints
router.post('/admin/login', adminLogin);
router.get('/admin/me', protect, requireAdmin, getAdminProfile);

export default router;
