import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  reorderCategories
} from '../controllers/categoryController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes for reading categories
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin-protected routes for managing categories
router.post('/', protect, requireAdmin, createCategory);
router.put('/:id', protect, requireAdmin, updateCategory);
router.delete('/:id', protect, requireAdmin, deleteCategory);
router.patch('/:id/status', protect, requireAdmin, toggleCategoryStatus);
router.patch('/reorder', protect, requireAdmin, reorderCategories);

export default router;
