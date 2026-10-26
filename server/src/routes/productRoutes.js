import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

const router = express.Router();

// Public / storefront endpoints
router.get('/', getProducts);
router.get('/:id', getProductById);

// Storefront & Admin mutations
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
