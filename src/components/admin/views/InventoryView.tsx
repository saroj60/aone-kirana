import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  AlertTriangle,
  Search,
  Plus,
  Minus,
  RefreshCw,
  History,
  Sliders,
  DollarSign,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Check
} from 'lucide-react';
import {
  inventoryService,
  InventoryItem,
  InventoryStats
} from '../../../services/inventoryService';
import { StockAdjustmentModal } from '../inventory/StockAdjustmentModal';
import { StockHistoryModal } from '../inventory/StockHistoryModal';

export const InventoryView: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalInventoryValue: 0,
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    recentlyUpdatedCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<InventoryItem | null>(null);
  const [adjustmentMode, setAdjustmentMode] = useState<'stock_in' | 'stock_out' | 'adjust'>('stock_in');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const [selectedItemForHistory, setSelectedItemForHistory] = useState<InventoryItem | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const res = await inventoryService.getInventory();
      setItems(res.items);
      setStats(res.stats);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Unique categories for filter
  const uniqueCategories = useMemo(() => {
    const set = new Set(items.map(i => i.category));
    return ['all', ...Array.from(set)];
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (categoryFilter !== 'all' && item.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        return (
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, categoryFilter, statusFilter, searchTerm]);

  // Quick Action triggers
  const handleOpenStockIn = (item: InventoryItem) => {
    setSelectedItemForAdjust(item);
    setAdjustmentMode('stock_in');
    setIsAdjustModalOpen(true);
  };

  const handleOpenStockOut = (item: InventoryItem) => {
    setSelectedItemForAdjust(item);
    setAdjustmentMode('stock_out');
    setIsAdjustModalOpen(true);
  };

  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedItemForAdjust(item);
    setAdjustmentMode('adjust');
    setIsAdjustModalOpen(true);
  };

  const handleOpenHistory = (item: InventoryItem | null = null) => {
    setSelectedItemForHistory(item);
    setIsHistoryModalOpen(true);
  };

  const handleModalSuccess = (msg: string) => {
    showToast(msg);
    loadInventory();
  };

  // Helper format currency
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-slideUp">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700">
              <Boxes className="w-5 h-5" />
            </span>
            <span>Inventory Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock monitoring, replenish thresholds, stock flow audit logs & valuation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenHistory(null)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Audit History</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset inventory stock counts back to defaults?')) {
                inventoryService.resetToDefaults();
                loadInventory();
                showToast('Inventory reset to initial defaults.');
              }
            }}
            title="Reset default stock counts"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inventory Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Inventory Value
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900">
              {formatCurrency(stats.totalInventoryValue)}
            </span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Tracked Products
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900">
              {stats.totalProducts} Items
            </span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Low Stock Alerts
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black text-amber-600">
                {stats.lowStockCount} Items
              </span>
              {stats.lowStockCount > 0 && (
                <button
                  onClick={() => setStatusFilter('low_stock')}
                  className="text-[10px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-full transition"
                >
                  View
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Out of Stock
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black text-rose-600">
                {stats.outOfStockCount} Items
              </span>
              {stats.outOfStockCount > 0 && (
                <button
                  onClick={() => setStatusFilter('out_of_stock')}
                  className="text-[10px] font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-2 py-0.5 rounded-full transition"
                >
                  Restock
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Banner if items are out of stock */}
      {(stats.lowStockCount > 0 || stats.outOfStockCount > 0) && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-900">
              <strong>Stock Replenishment Warning:</strong> You have{' '}
              <span className="font-bold">{stats.outOfStockCount} items completely out of stock</span> and{' '}
              <span className="font-bold">{stats.lowStockCount} items below safety threshold</span>.
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter('low_stock')}
              className="px-3 py-1.5 bg-amber-200/80 hover:bg-amber-300 text-amber-900 rounded-xl text-xs font-bold transition"
            >
              Filter Low Stock
            </button>
            <button
              onClick={() => setStatusFilter('out_of_stock')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-2xs"
            >
              Filter Out of Stock
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU (e.g. AK-VEG-001), or category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-bold focus:outline-hidden cursor-pointer capitalize"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('in_stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'in_stock'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStatusFilter('low_stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'low_stock'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Low Stock ({stats.lowStockCount})
            </button>
            <button
              onClick={() => setStatusFilter('out_of_stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'out_of_stock'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Out of Stock ({stats.outOfStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Product / SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Current Stock</th>
                <th className="py-3.5 px-4 text-center">Safety Threshold</th>
                <th className="py-3.5 px-4 text-right">Value (Price)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Last Updated</th>
                <th className="py-3.5 px-4 text-right">Quick Stock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading warehouse inventory data...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600 text-sm">No inventory items found</p>
                    <p className="text-xs text-slate-400 mt-1">Try modifying your search or status filter</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const updatedRelative = new Date(item.lastUpdated).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Product image & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200/80 shrink-0"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                                {item.sku}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">{item.unit}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded-lg border border-slate-200/60">
                          {item.category}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-sm font-black ${
                            item.currentStock <= 0
                              ? 'text-rose-600'
                              : item.currentStock <= item.minStock
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {item.currentStock}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {item.unit}
                        </span>
                      </td>

                      {/* Minimum Stock Safety Threshold */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                        <span>{item.minStock}</span>
                        <span className="text-[10px] text-slate-400 block font-medium">units</span>
                      </td>

                      {/* Price / Inventory Value */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900">
                          {formatCurrency(item.currentStock * item.price)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          @ Rs. {item.price}/{item.unit}
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            item.status === 'out_of_stock'
                              ? 'bg-rose-100 text-rose-800'
                              : item.status === 'low_stock'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.status === 'out_of_stock' ? (
                            <span>Out of Stock</span>
                          ) : item.status === 'low_stock' ? (
                            <span>Low Stock</span>
                          ) : (
                            <span>In Stock</span>
                          )}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 text-center text-slate-500 text-[11px] font-medium">
                        {updatedRelative}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Stock In (+) */}
                          <button
                            type="button"
                            onClick={() => handleOpenStockIn(item)}
                            title="Stock In (+ Increase Stock)"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold transition flex items-center gap-1 shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-[11px] hidden sm:inline">In</span>
                          </button>

                          {/* Stock Out (-) */}
                          <button
                            type="button"
                            onClick={() => handleOpenStockOut(item)}
                            title="Stock Out (- Decrease Stock)"
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold transition flex items-center gap-1 shadow-2xs"
                          >
                            <Minus className="w-3.5 h-3.5" />
                            <span className="text-[11px] hidden sm:inline">Out</span>
                          </button>

                          {/* Adjust Sliders */}
                          <button
                            type="button"
                            onClick={() => handleOpenAdjust(item)}
                            title="Manual Stock Adjustment"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* Item History */}
                          <button
                            type="button"
                            onClick={() => handleOpenHistory(item)}
                            title="View Stock Flow History"
                            className="p-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-500 rounded-lg transition"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        item={selectedItemForAdjust}
        mode={adjustmentMode}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setSelectedItemForAdjust(null);
        }}
        onSuccess={handleModalSuccess}
      />

      {/* Stock History Audit Modal */}
      <StockHistoryModal
        isOpen={isHistoryModalOpen}
        item={selectedItemForHistory}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedItemForHistory(null);
        }}
      />
    </div>
  );
};
