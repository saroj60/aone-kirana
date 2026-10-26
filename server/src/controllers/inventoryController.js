import { Product } from '../models/Product.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import mongoose from 'mongoose';

// Fallback seed catalog for inventory when MongoDB is not connected
const INITIAL_INVENTORY_SEEDS = [
  {
    id: 'inv-001',
    productId: 'prod-tomato',
    name: 'Tomato (Hybrid Red)',
    sku: 'AK-VEG-001',
    category: 'Vegetables',
    currentStock: 48,
    minStock: 15,
    unit: '1 kg',
    price: 80,
    costPrice: 55,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'inv-002',
    productId: 'prod-potato',
    name: 'Hill Potato (Washed)',
    sku: 'AK-VEG-002',
    category: 'Vegetables',
    currentStock: 85,
    minStock: 25,
    unit: '1 kg',
    price: 50,
    costPrice: 32,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80',
    lastUpdated: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'inv-003',
    productId: 'prod-onion',
    name: 'Red Onion (Nasik)',
    sku: 'AK-VEG-003',
    category: 'Vegetables',
    currentStock: 12,
    minStock: 20,
    unit: '1 kg',
    price: 60,
    costPrice: 42,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80',
    lastUpdated: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'inv-004',
    productId: 'prod-carrot',
    name: 'Sweet Orange Carrot',
    sku: 'AK-VEG-004',
    category: 'Vegetables',
    currentStock: 6,
    minStock: 15,
    unit: '500 g',
    price: 60,
    costPrice: 38,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80',
    lastUpdated: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 'inv-005',
    productId: 'prod-banana',
    name: 'Robusta Bananas',
    sku: 'AK-FRU-001',
    category: 'Fruits',
    currentStock: 0,
    minStock: 15,
    unit: '1 kg',
    price: 120,
    costPrice: 85,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80',
    lastUpdated: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'inv-006',
    productId: 'prod-apple-local',
    name: 'Mustang Local Apples',
    sku: 'AK-FRU-002',
    category: 'Fruits',
    currentStock: 35,
    minStock: 15,
    unit: '1 kg',
    price: 160,
    costPrice: 110,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
    lastUpdated: new Date(Date.now() - 18000000).toISOString()
  },
  {
    id: 'inv-007',
    productId: 'prod-rice-basmati',
    name: 'India Gate Basmati Rice Feast Rozzana',
    sku: 'AK-GRA-001',
    category: 'Grains',
    currentStock: 24,
    minStock: 10,
    unit: '5 kg',
    price: 780,
    costPrice: 620,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    lastUpdated: new Date(Date.now() - 21600000).toISOString()
  },
  {
    id: 'inv-008',
    productId: 'prod-mustard-oil',
    name: 'Dhara Pure Kachi Ghani Mustard Oil',
    sku: 'AK-ESS-001',
    category: 'Essentials',
    currentStock: 4,
    minStock: 12,
    unit: '1 L',
    price: 260,
    costPrice: 205,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    lastUpdated: new Date(Date.now() - 25200000).toISOString()
  },
  {
    id: 'inv-009',
    productId: 'prod-dairy-milk',
    name: 'DDC Toned Milk Packet',
    sku: 'AK-DAI-001',
    category: 'Dairy',
    currentStock: 42,
    minStock: 20,
    unit: '500 ml',
    price: 55,
    costPrice: 42,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    lastUpdated: new Date(Date.now() - 28800000).toISOString()
  },
  {
    id: 'inv-010',
    productId: 'prod-atta-chakki',
    name: 'Aashirvaad Superior MP Sharbati Atta',
    sku: 'AK-GRA-002',
    category: 'Grains',
    currentStock: 0,
    minStock: 10,
    unit: '5 kg',
    price: 450,
    costPrice: 360,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    lastUpdated: new Date(Date.now() - 32400000).toISOString()
  }
];

let memoryInventory = [...INITIAL_INVENTORY_SEEDS];
let memoryTransactions = [
  {
    id: 'tx-001',
    productId: 'prod-tomato',
    productName: 'Tomato (Hybrid Red)',
    sku: 'AK-VEG-001',
    previousQuantity: 28,
    changedQuantity: 20,
    newQuantity: 48,
    type: 'stock_in',
    reason: 'Farm fresh morning replenishment from Kalimati',
    notes: 'Received batch in excellent condition',
    admin: { id: 'admin-001', name: 'Aone Kirana Admin', email: 'admin@aonekirana.com' },
    allowNegativeStock: false,
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'tx-002',
    productId: 'prod-banana',
    productName: 'Robusta Bananas',
    sku: 'AK-FRU-001',
    previousQuantity: 15,
    changedQuantity: -15,
    newQuantity: 0,
    type: 'stock_out',
    reason: 'Sold out via express local delivery orders',
    notes: 'Awaiting distributor restock tomorrow morning',
    admin: { id: 'admin-001', name: 'Aone Kirana Admin', email: 'admin@aonekirana.com' },
    allowNegativeStock: false,
    createdAt: new Date(Date.now() - 14400000).toISOString()
  }
];

/**
 * Helper to compute stock status
 */
const getStockStatus = (current, min) => {
  if (current <= 0) return 'out_of_stock';
  if (current <= min) return 'low_stock';
  return 'in_stock';
};

/**
 * @desc Get all inventory items with summary stats
 * @route GET /api/inventory
 */
export const getInventory = async (req, res) => {
  try {
    const { category, status, search } = req.query;

    let items = [...memoryInventory];

    // Filter by category
    if (category && category !== 'all') {
      items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by stock status
    if (status && status !== 'all') {
      items = items.filter(i => getStockStatus(i.currentStock, i.minStock) === status);
    }

    // Filter by search query (name, sku, category)
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }

    // Calculate Dashboard Summary KPIs
    const allItems = memoryInventory;
    const totalInventoryValue = allItems.reduce((acc, curr) => acc + (curr.currentStock * curr.price), 0);
    const totalProducts = allItems.length;
    const lowStockCount = allItems.filter(i => i.currentStock > 0 && i.currentStock <= i.minStock).length;
    const outOfStockCount = allItems.filter(i => i.currentStock <= 0).length;

    // Recently updated items
    const recentlyUpdated = [...allItems]
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalInventoryValue,
        totalProducts,
        lowStockCount,
        outOfStockCount,
        recentlyUpdatedCount: recentlyUpdated.length
      },
      data: items.map(item => ({
        ...item,
        status: getStockStatus(item.currentStock, item.minStock)
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Adjust inventory stock (Manual Adjustment)
 * @route POST /api/inventory/adjust
 */
export const adjustStock = async (req, res) => {
  try {
    const {
      productId,
      newQuantity,
      reason,
      notes = '',
      allowNegativeStock = false
    } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    const qty = Number(newQuantity);
    if (isNaN(qty)) {
      return res.status(400).json({ success: false, message: 'Valid newQuantity is required' });
    }

    // Check negative stock prevention
    if (qty < 0 && !allowNegativeStock) {
      return res.status(400).json({
        success: false,
        message: 'Negative stock is not permitted. Enable "Allow negative stock" if this is intentional.'
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Reason for adjustment is required' });
    }

    const itemIndex = memoryInventory.findIndex(i => i.productId === productId || i.id === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product inventory item not found' });
    }

    const item = memoryInventory[itemIndex];
    const previousQty = item.currentStock;
    const changedQty = qty - previousQty;

    // Update item stock
    item.currentStock = qty;
    item.lastUpdated = new Date().toISOString();
    memoryInventory[itemIndex] = item;

    // Create history transaction record
    const admin = req.user ? {
      id: req.user.id || 'admin-001',
      name: req.user.name || 'Aone Kirana Admin',
      email: req.user.email || 'admin@aonekirana.com'
    } : {
      id: 'admin-001',
      name: 'Aone Kirana Admin',
      email: 'admin@aonekirana.com'
    };

    const transaction = {
      id: `tx-${Date.now()}`,
      productId: item.productId,
      productName: item.name,
      sku: item.sku,
      category: item.category,
      previousQuantity: previousQty,
      changedQuantity: changedQty,
      newQuantity: qty,
      type: 'manual_adjustment',
      reason: reason.trim(),
      notes: notes.trim(),
      admin,
      allowNegativeStock,
      createdAt: new Date().toISOString()
    };

    memoryTransactions.unshift(transaction);

    // If Mongoose is active, persist to MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        await InventoryTransaction.create(transaction);
        await Product.findOneAndUpdate(
          { _id: item.productId.match(/^[0-9a-fA-F]{24}$/) ? item.productId : null },
          { $set: { stockQuantity: qty, inStock: qty > 0 } }
        );
      } catch (dbErr) {
        console.warn('MongoDB sync error, memory stored:', dbErr);
      }
    }

    res.json({
      success: true,
      message: `Stock for ${item.name} adjusted from ${previousQty} to ${qty} ${item.unit}.`,
      item: {
        ...item,
        status: getStockStatus(item.currentStock, item.minStock)
      },
      transaction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Stock In (Increase stock)
 * @route POST /api/inventory/stock-in
 */
export const stockIn = async (req, res) => {
  try {
    const { productId, quantity, reason, notes = '' } = req.body;

    const amount = Number(quantity);
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Stock-in quantity must be greater than 0' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Stock-in reason is required (e.g. Supplier Restock)' });
    }

    const itemIndex = memoryInventory.findIndex(i => i.productId === productId || i.id === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in inventory' });
    }

    const item = memoryInventory[itemIndex];
    const previousQty = item.currentStock;
    const newQty = previousQty + amount;

    item.currentStock = newQty;
    item.lastUpdated = new Date().toISOString();
    memoryInventory[itemIndex] = item;

    const admin = req.user ? {
      id: req.user.id || 'admin-001',
      name: req.user.name || 'Aone Kirana Admin',
      email: req.user.email || 'admin@aonekirana.com'
    } : {
      id: 'admin-001',
      name: 'Aone Kirana Admin',
      email: 'admin@aonekirana.com'
    };

    const transaction = {
      id: `tx-${Date.now()}`,
      productId: item.productId,
      productName: item.name,
      sku: item.sku,
      category: item.category,
      previousQuantity: previousQty,
      changedQuantity: amount,
      newQuantity: newQty,
      type: 'stock_in',
      reason: reason.trim(),
      notes: notes.trim(),
      admin,
      allowNegativeStock: false,
      createdAt: new Date().toISOString()
    };

    memoryTransactions.unshift(transaction);

    res.json({
      success: true,
      message: `Successfully added +${amount} ${item.unit} to ${item.name}. New stock: ${newQty}`,
      item: {
        ...item,
        status: getStockStatus(item.currentStock, item.minStock)
      },
      transaction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Stock Out (Decrease stock)
 * @route POST /api/inventory/stock-out
 */
export const stockOut = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      reason,
      notes = '',
      allowNegativeStock = false
    } = req.body;

    const amount = Number(quantity);
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Stock-out quantity must be greater than 0' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Stock-out reason is required (e.g. Sales, Wastage, Expired)' });
    }

    const itemIndex = memoryInventory.findIndex(i => i.productId === productId || i.id === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in inventory' });
    }

    const item = memoryInventory[itemIndex];
    const previousQty = item.currentStock;
    const newQty = previousQty - amount;

    // Negative stock prevention
    if (newQty < 0 && !allowNegativeStock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock! Cannot reduce ${amount} ${item.unit} when only ${previousQty} is available.`
      });
    }

    item.currentStock = newQty;
    item.lastUpdated = new Date().toISOString();
    memoryInventory[itemIndex] = item;

    const admin = req.user ? {
      id: req.user.id || 'admin-001',
      name: req.user.name || 'Aone Kirana Admin',
      email: req.user.email || 'admin@aonekirana.com'
    } : {
      id: 'admin-001',
      name: 'Aone Kirana Admin',
      email: 'admin@aonekirana.com'
    };

    const transaction = {
      id: `tx-${Date.now()}`,
      productId: item.productId,
      productName: item.name,
      sku: item.sku,
      category: item.category,
      previousQuantity: previousQty,
      changedQuantity: -amount,
      newQuantity: newQty,
      type: 'stock_out',
      reason: reason.trim(),
      notes: notes.trim(),
      admin,
      allowNegativeStock,
      createdAt: new Date().toISOString()
    };

    memoryTransactions.unshift(transaction);

    res.json({
      success: true,
      message: `Successfully deducted -${amount} ${item.unit} from ${item.name}. New stock: ${newQty}`,
      item: {
        ...item,
        status: getStockStatus(item.currentStock, item.minStock)
      },
      transaction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get all inventory history transactions
 * @route GET /api/inventory/transactions
 */
export const getTransactions = async (req, res) => {
  try {
    const { productId, type } = req.query;

    let records = [...memoryTransactions];

    if (productId) {
      records = records.filter(t => t.productId === productId);
    }

    if (type && type !== 'all') {
      records = records.filter(t => t.type === type);
    }

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
