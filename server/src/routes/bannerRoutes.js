import express from 'express';
import {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  toggleBannerStatus,
  reorderBanners,
  deleteBanner,
  recordBannerClick
} from '../controllers/bannerController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public Endpoints (Used by customer storefront)
router.get('/active', getActiveBanners);
router.post('/:id/click', recordBannerClick);

// Admin Management Endpoints
router.get('/', protect, requireAdmin, getAllBanners);
router.get('/:id', protect, requireAdmin, getBannerById);
router.post('/', protect, requireAdmin, createBanner);
router.put('/reorder', protect, requireAdmin, reorderBanners);
router.put('/:id', protect, requireAdmin, updateBanner);
router.patch('/:id/toggle', protect, requireAdmin, toggleBannerStatus);
router.delete('/:id', protect, requireAdmin, deleteBanner);

export default router;
