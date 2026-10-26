export interface InventoryItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  price: number;
  costPrice: number;
  image: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
}

export interface InventoryStats {
  totalInventoryValue: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentlyUpdatedCount: number;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  previousQuantity: number;
  changedQuantity: number;
  newQuantity: number;
  type: 'stock_in' | 'stock_out' | 'manual_adjustment' | 'audit';
  reason: string;
  notes?: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
  allowNegativeStock?: boolean;
  createdAt: string;
}

const ITEMS_STORAGE_KEY = 'aone_inventory_items_v1';
const TRANSACTIONS_STORAGE_KEY = 'aone_inventory_transactions_v1';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Initial pre-seeded catalog with 14 diverse grocery staples
export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
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
    status: 'in_stock',
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
    status: 'in_stock',
    lastUpdated: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'inv-003',
    productId: 'prod-onion',
    name: 'Red Onion (Nasik Premium)',
    sku: 'AK-VEG-003',
    category: 'Vegetables',
    currentStock: 12,
    minStock: 20,
    unit: '1 kg',
    price: 60,
    costPrice: 42,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80',
    status: 'low_stock',
    lastUpdated: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'inv-004',
    productId: 'prod-carrot',
    name: 'Sweet Orange Carrot',
    sku: 'AK-VEG-004',
    category: 'Vegetables',
    currentStock: 7,
    minStock: 15,
    unit: '500 g',
    price: 60,
    costPrice: 38,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80',
    status: 'low_stock',
    lastUpdated: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 'inv-005',
    productId: 'prod-banana',
    name: 'Robusta Bananas (Ripe)',
    sku: 'AK-FRU-001',
    category: 'Fruits',
    currentStock: 0,
    minStock: 15,
    unit: '1 kg',
    price: 120,
    costPrice: 85,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80',
    status: 'out_of_stock',
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
    status: 'in_stock',
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
    status: 'in_stock',
    lastUpdated: new Date(Date.now() - 21600000).toISOString()
  },
  {
    id: 'inv-008',
    productId: 'prod-mustard-oil',
    name: 'Dhara Pure Kachi Ghani Mustard Oil',
    sku: 'AK-ESS-001',
    category: 'Essentials',
    currentStock: 5,
    minStock: 12,
    unit: '1 L',
    price: 260,
    costPrice: 205,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    status: 'low_stock',
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
    status: 'in_stock',
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
    status: 'out_of_stock',
    lastUpdated: new Date(Date.now() - 32400000).toISOString()
  },
  {
    id: 'inv-011',
    productId: 'prod-paneer',
    name: 'Fresh Dairy Paneer (Malai)',
    sku: 'AK-DAI-002',
    category: 'Dairy',
    currentStock: 18,
    minStock: 10,
    unit: '200 g',
    price: 180,
    costPrice: 140,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
    status: 'in_stock',
    lastUpdated: new Date(Date.now() - 36000000).toISOString()
  },
  {
    id: 'inv-012',
    productId: 'prod-tea-leaves',
    name: 'Tokla Gold Premium CTC Leaf Tea',
    sku: 'AK-BEV-001',
    category: 'Snacks & Beverages',
    currentStock: 8,
    minStock: 15,
    unit: '500 g',
    price: 320,
    costPrice: 250,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    status: 'low_stock',
    lastUpdated: new Date(Date.now() - 39600000).toISOString()
  }
];

export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'tx-001',
    productId: 'prod-tomato',
    productName: 'Tomato (Hybrid Red)',
    sku: 'AK-VEG-001',
    category: 'Vegetables',
    previousQuantity: 28,
    changedQuantity: 20,
    newQuantity: 48,
    type: 'stock_in',
    reason: 'Direct farm shipment from Kavre valley',
    notes: 'Grade A fresh harvest',
    admin: { id: 'admin-001', name: 'Aone Kirana Admin', email: 'admin@aonekirana.com' },
    allowNegativeStock: false,
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'tx-002',
    productId: 'prod-banana',
    productName: 'Robusta Bananas (Ripe)',
    sku: 'AK-FRU-001',
    category: 'Fruits',
    previousQuantity: 15,
    changedQuantity: -15,
    newQuantity: 0,
    type: 'stock_out',
    reason: 'Sold out via express orders batch #309',
    notes: 'Supplier replenishment booked for tomorrow 7 AM',
    admin: { id: 'admin-001', name: 'Aone Kirana Admin', email: 'admin@aonekirana.com' },
    allowNegativeStock: false,
    createdAt: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'tx-003',
    productId: 'prod-onion',
    productName: 'Red Onion (Nasik Premium)',
    sku: 'AK-VEG-003',
    category: 'Vegetables',
    previousQuantity: 15,
    changedQuantity: -3,
    newQuantity: 12,
    type: 'stock_out',
    reason: 'Damaged & decomposed sorting loss',
    notes: 'Discarded during morning quality screening',
    admin: { id: 'admin-001', name: 'Aone Kirana Admin', email: 'admin@aonekirana.com' },
    allowNegativeStock: false,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

class InventoryService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('aone_admin_jwt_token') || sessionStorage.getItem('aone_admin_jwt_token');
    if (token) return { Authorization: `Bearer ${token}` };
    return {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsInJvbGUiOiJhZG1pbiJ9.mock_jwt_signature`
    };
  }

  private computeStatus(current: number, min: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (current <= 0) return 'out_of_stock';
    if (current <= min) return 'low_stock';
    return 'in_stock';
  }

  /**
   * Get Inventory items and dashboard summary KPIs
   */
  async getInventory(options?: {
    category?: string;
    status?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
    search?: string;
  }): Promise<{ items: InventoryItem[]; stats: InventoryStats }> {
    // 1. Try Backend REST API
    try {
      const q = new URLSearchParams();
      if (options?.category && options.category !== 'all') q.set('category', options.category);
      if (options?.status && options.status !== 'all') q.set('status', options.status);
      if (options?.search) q.set('search', options.search);

      const res = await fetch(`${API_BASE_URL}/inventory?${q.toString()}`, {
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.saveItems(json.data);
          return { items: json.data, stats: json.stats };
        }
      }
    } catch (e) {
      console.warn('Backend inventory offline, using local storage:', e);
    }

    // 2. Local Storage Fallback
    const allItems = this.getItems();
    let filtered = [...allItems];

    if (options?.category && options.category !== 'all') {
      filtered = filtered.filter(i => i.category.toLowerCase() === options.category?.toLowerCase());
    }

    if (options?.status && options.status !== 'all') {
      filtered = filtered.filter(i => i.status === options.status);
    }

    if (options?.search && options.search.trim()) {
      const term = options.search.toLowerCase().trim();
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(term) ||
        i.sku.toLowerCase().includes(term) ||
        i.category.toLowerCase().includes(term)
      );
    }

    // Stats
    const totalInventoryValue = allItems.reduce((acc, curr) => acc + (curr.currentStock * curr.price), 0);
    const lowStockCount = allItems.filter(i => i.currentStock > 0 && i.currentStock <= i.minStock).length;
    const outOfStockCount = allItems.filter(i => i.currentStock <= 0).length;

    const stats: InventoryStats = {
      totalInventoryValue,
      totalProducts: allItems.length,
      lowStockCount,
      outOfStockCount,
      recentlyUpdatedCount: allItems.length
    };

    return { items: filtered, stats };
  }

  /**
   * Increase Stock (Stock-In)
   */
  async stockIn(params: {
    productId: string;
    quantity: number;
    reason: string;
    notes?: string;
  }): Promise<{ item: InventoryItem; transaction: InventoryTransaction }> {
    const { productId, quantity, reason, notes = '' } = params;

    if (quantity <= 0) {
      throw new Error('Stock-in quantity must be greater than zero.');
    }
    if (!reason.trim()) {
      throw new Error('Please select or specify a reason for stock-in.');
    }

    // Try API
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/stock-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          this.updateLocalItem(json.item);
          this.addLocalTransaction(json.transaction);
          return { item: json.item, transaction: json.transaction };
        }
      }
    } catch (e) {
      console.warn('API error, handling stockIn locally:', e);
    }

    // Local
    const items = this.getItems();
    const item = items.find(i => i.productId === productId || i.id === productId);
    if (!item) throw new Error('Product not found in inventory.');

    const previousQty = item.currentStock;
    const newQty = previousQty + quantity;

    const updatedItem: InventoryItem = {
      ...item,
      currentStock: newQty,
      status: this.computeStatus(newQty, item.minStock),
      lastUpdated: new Date().toISOString()
    };

    const transaction: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      productId: item.productId,
      productName: item.name,
      sku: item.sku,
      category: item.category,
      previousQuantity: previousQty,
      changedQuantity: quantity,
      newQuantity: newQty,
      type: 'stock_in',
      reason: reason.trim(),
      notes: notes.trim(),
      admin: this.getAdminInfo(),
      allowNegativeStock: false,
      createdAt: new Date().toISOString()
    };

    this.updateLocalItem(updatedItem);
    this.addLocalTransaction(transaction);
    return { item: updatedItem, transaction };
  }

  /**
   * Decrease Stock (Stock-Out) with Negative Stock Prevention
   */
  async stockOut(params: {
    productId: string;
    quantity: number;
    reason: string;
    notes?: string;
    allowNegativeStock?: boolean;
  }): Promise<{ item: InventoryItem; transaction: InventoryTransaction }> {
    const { productId, quantity, reason, notes = '', allowNegativeStock = false } = params;

    if (quantity <= 0) {
      throw new Error('Stock-out quantity must be greater than zero.');
    }
    if (!reason.trim()) {
      throw new Error('Please select or specify a reason for stock-out.');
    }

    // Try API
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/stock-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          this.updateLocalItem(json.item);
          this.addLocalTransaction(json.transaction);
          return { item: json.item, transaction: json.transaction };
        }
      } else {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Stock-out failed');
      }
    } catch (e: any) {
      if (e.message && e.message.includes('Insufficient stock')) {
        throw e;
      }
      console.warn('API error, handling stockOut locally:', e);
    }

    // Local
    const items = this.getItems();
    const item = items.find(i => i.productId === productId || i.id === productId);
    if (!item) throw new Error('Product not found in inventory.');

    const previousQty = item.currentStock;
    const newQty = previousQty - quantity;

    // Prevent negative stock unless explicitly configured
    if (newQty < 0 && !allowNegativeStock) {
      throw new Error(
        `Negative stock prevented! Cannot decrease ${quantity} ${item.unit}. Available inventory is only ${previousQty} ${item.unit}.`
      );
    }

    const updatedItem: InventoryItem = {
      ...item,
      currentStock: newQty,
      status: this.computeStatus(newQty, item.minStock),
      lastUpdated: new Date().toISOString()
    };

    const transaction: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      productId: item.productId,
      productName: item.name,
      sku: item.sku,
      category: item.category,
      previousQuantity: previousQty,
      changedQuantity: -quantity,
      newQuantity: newQty,
      type: 'stock_out',
      reason: reason.trim(),
      notes: notes.trim(),
      admin: this.getAdminInfo(),
      allowNegativeStock,
      createdAt: new Date().toISOString()
    };

    this.updateLocalItem(updatedItem);
    this.addLocalTransaction(transaction);
    return { item: updatedItem, transaction };
  }

  /**
   * Manual Stock Adjustment with Negative Stock Check
   */
  async adjustStock(params: {
    productId: string;
    newQuantity: number;
    reason: string;
    notes?: string;
    allowNegativeStock?: boolean;
    minStock?: number;
  }): Promise<{ item: InventoryItem; transaction: InventoryTransaction }> {
    const { productId, newQuantity, reason, notes = '', allowNegativeStock = false, minStock } = params;

    if (isNaN(newQuantity)) {
      throw new Error('Please enter a valid stock quantity.');
    }
    if (newQuantity < 0 && !allowNegativeStock) {
      throw new Error('Negative stock is not permitted. Enable override checkbox to permit negative stock.');
    }
    if (!reason.trim()) {
      throw new Error('Please state the reason for this manual stock adjustment.');
    }

    // Try API
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          this.updateLocalItem(json.item);
          this.addLocalTransaction(json.transaction);
          return { item: json.item, transaction: json.transaction };
        }
      }
    } catch (e) {
      console.warn('API error, handling adjustStock locally:', e);
    }

    // Local
    const items = this.getItems();
    const item = items.find(i => i.productId === productId || i.id === productId);
    if (!item) throw new Error('Product not found in inventory.');

    const previousQty = item.currentStock;
    const changedQty = newQuantity - previousQty;
    const updatedMin = minStock !== undefined ? minStock : item.minStock;

    const updatedItem: InventoryItem = {
      ...item,
      currentStock: newQuantity,
      minStock: updatedMin,
      status: this.computeStatus(newQuantity, updatedMin),
      lastUpdated: new Date().toISOString()
    };

    const transaction: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      productId: item.productId,
      productName: item.name,
      sku: item.sku,
      category: item.category,
      previousQuantity: previousQty,
      changedQuantity: changedQty,
      newQuantity: newQuantity,
      type: 'manual_adjustment',
      reason: reason.trim(),
      notes: notes.trim(),
      admin: this.getAdminInfo(),
      allowNegativeStock,
      createdAt: new Date().toISOString()
    };

    this.updateLocalItem(updatedItem);
    this.addLocalTransaction(transaction);
    return { item: updatedItem, transaction };
  }

  /**
   * Get Stock Transaction History
   */
  async getTransactions(productId?: string): Promise<InventoryTransaction[]> {
    // Try API
    try {
      const url = productId
        ? `${API_BASE_URL}/inventory/transactions?productId=${productId}`
        : `${API_BASE_URL}/inventory/transactions`;
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      // ignore
    }

    // Local
    const txs = this.getTransactionsFromStorage();
    if (productId) {
      return txs.filter(t => t.productId === productId);
    }
    return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Reset Inventory to initial defaults
   */
  resetToDefaults(): void {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(INITIAL_INVENTORY_ITEMS));
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
  }

  // --- Internal Helpers ---
  private getAdminInfo(): { id: string; name: string; email: string } {
    try {
      const raw = localStorage.getItem('aone_admin_user_data') || sessionStorage.getItem('aone_admin_user_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          id: parsed.id || 'admin-001',
          name: parsed.name || 'Aone Kirana Admin',
          email: parsed.email || 'admin@aonekirana.com'
        };
      }
    } catch (e) {
      // ignore
    }
    return { id: 'admin-001', name: 'Aone Kirana Admin', email: 'admin@aonekirana.com' };
  }

  private getItems(): InventoryItem[] {
    try {
      const raw = localStorage.getItem(ITEMS_STORAGE_KEY);
      if (!raw) {
        this.saveItems(INITIAL_INVENTORY_ITEMS);
        return [...INITIAL_INVENTORY_ITEMS];
      }
      return JSON.parse(raw);
    } catch (e) {
      return [...INITIAL_INVENTORY_ITEMS];
    }
  }

  private saveItems(items: InventoryItem[]): void {
    try {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save inventory items:', e);
    }
  }

  private updateLocalItem(updated: InventoryItem): void {
    const items = this.getItems();
    const index = items.findIndex(i => i.productId === updated.productId || i.id === updated.id);
    if (index !== -1) {
      items[index] = updated;
    } else {
      items.unshift(updated);
    }
    this.saveItems(items);
  }

  private getTransactionsFromStorage(): InventoryTransaction[] {
    try {
      const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
        return [...INITIAL_TRANSACTIONS];
      }
      return JSON.parse(raw);
    } catch (e) {
      return [...INITIAL_TRANSACTIONS];
    }
  }

  private addLocalTransaction(tx: InventoryTransaction): void {
    const list = this.getTransactionsFromStorage();
    list.unshift(tx);
    try {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save transaction:', e);
    }
  }
}

export const inventoryService = new InventoryService();
