import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'General'
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  changedQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['stock_in', 'stock_out', 'manual_adjustment', 'audit'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    default: ''
  },
  admin: {
    id: { type: String, default: 'admin-001' },
    name: { type: String, default: 'Aone Kirana Admin' },
    email: { type: String, default: 'admin@aonekirana.com' }
  },
  allowNegativeStock: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

export const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
