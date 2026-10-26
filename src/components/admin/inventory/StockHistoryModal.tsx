import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  Search,
  Filter,
  User,
  Calendar,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import {
  InventoryItem,
  InventoryTransaction,
  inventoryService
} from '../../../services/inventoryService';

interface StockHistoryModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
}

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  isOpen,
  item,
  onClose
}) => {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'stock_in' | 'stock_out' | 'manual_adjustment'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      inventoryService
        .getTransactions(item ? item.productId : undefined)
        .then(data => {
          setTransactions(data);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, item]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        t.productName.toLowerCase().includes(q) ||
        t.sku.toLowerCase().includes(q) ||
        t.reason.toLowerCase().includes(q) ||
        t.admin.name.toLowerCase().includes(q)
      );
    });
  }, [transactions, filterType, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {item ? `${item.name} Stock Audit History` : 'Complete Inventory Transaction Log'}
              </h3>
              <p className="text-xs text-slate-500">
                Immutable record of stock-in, stock-out, and manual inventory adjustments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('stock_in')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'stock_in'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock In
            </button>
            <button
              onClick={() => setFilterType('stock_out')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'stock_out'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock Out
            </button>
            <button
              onClick={() => setFilterType('manual_adjustment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'manual_adjustment'
                  ? 'bg-brand-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Adjustments
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* History Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span className="text-xs">Loading transaction history...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600 text-sm">No transaction records found</p>
              <p className="text-xs text-slate-400 mt-0.5">Try altering the filter or search term</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-3 font-semibold">Date & Time</th>
                    {!item && <th className="pb-3 px-3 font-semibold">Product / SKU</th>}
                    <th className="pb-3 px-3 font-semibold text-center">Type</th>
                    <th className="pb-3 px-3 font-semibold text-center">Qty Change</th>
                    <th className="pb-3 px-3 font-semibold text-center">Stock Flow</th>
                    <th className="pb-3 px-3 font-semibold">Reason & Notes</th>
                    <th className="pb-3 pl-3 font-semibold text-right">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTransactions.map(tx => {
                    const isPositive = tx.changedQuantity > 0;
                    const dateFormatted = new Date(tx.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Timestamp */}
                        <td className="py-3 pr-3 whitespace-nowrap text-slate-500 font-medium">
                          {dateFormatted}
                        </td>

                        {/* Product info if viewing global log */}
                        {!item && (
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{tx.productName}</div>
                            <div className="text-[10px] font-mono text-slate-400">{tx.sku}</div>
                          </td>
                        )}

                        {/* Type Badge */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              tx.type === 'stock_in'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.type === 'stock_out'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-brand-100 text-brand-800'
                            }`}
                          >
                            {tx.type === 'stock_in' ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : tx.type === 'stock_out' ? (
                              <ArrowDownRight className="w-3 h-3" />
                            ) : (
                              <Sliders className="w-3 h-3" />
                            )}
                            <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                          </span>
                        </td>

                        {/* Changed Quantity */}
                        <td className="py-3 px-3 text-center font-black">
                          <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                            {isPositive ? `+${tx.changedQuantity}` : tx.changedQuantity}
                          </span>
                        </td>

                        {/* Previous -> New */}
                        <td className="py-3 px-3 text-center text-slate-500 font-semibold whitespace-nowrap">
                          <span>{tx.previousQuantity}</span>
                          <span className="text-slate-300 mx-1.5">→</span>
                          <span className="font-bold text-slate-900">{tx.newQuantity}</span>
                        </td>

                        {/* Reason & Notes */}
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{tx.reason}</div>
                          {tx.notes && (
                            <div className="text-[11px] text-slate-400 mt-0.5 italic">
                              "{tx.notes}"
                            </div>
                          )}
                        </td>

                        {/* Admin */}
                        <td className="py-3 pl-3 text-right whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{tx.admin?.name || 'Admin'}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Showing {filteredTransactions.length} of {transactions.length} recorded audit events
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
