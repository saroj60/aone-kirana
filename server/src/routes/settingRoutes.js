import express from 'express';
import {
  getSettings,
  updateSettings,
  changeAdminPassword,
  getActiveSessions,
  logoutAllSessions
} from '../controllers/settingController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Shared Store Settings (Used by customer storefront and admin dashboard)
router.get('/', getSettings);

// Admin-Protected Settings Operations
router.put('/', protect, requireAdmin, updateSettings);
router.post('/change-password', protect, requireAdmin, changeAdminPassword);
router.get('/sessions', protect, requireAdmin, getActiveSessions);
router.post('/sessions/logout-all', protect, requireAdmin, logoutAllSessions);

export default router;
