import React, { useState } from 'react';
import { LowStockItem } from '../../../services/adminService';
import { AlertTriangle, Plus, ArrowUpRight, Check } from 'lucide-react';
import { StockUpdateModal } from './StockUpdateModal';

interface LowStockTableProps {
  items: LowStockItem[];
  onStockUpdated?: (id: string, newStock: number, newMinStock: number) => void;
  onViewAllInventory?: () => void;
}

export const LowStockTable: React.FC<LowStockTableProps> = ({
  items,
  onStockUpdated,
  onViewAllInventory
}) => {
  const [selectedItem, setSelectedItem] = useState<LowStockItem | null>(null);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Low Stock Alerts</span>
            </h3>
            <span className="text-[10px] bg-rose-50 text-rose-700 font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
              {items.length} Needs Attention
            </span>
          </div>
          <p className="text-xs text-slate-400">Products nearing depleted inventory thresholds</p>
        </div>

        {onViewAllInventory && (
          <button
            onClick={onViewAllInventory}
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            <span>Full Inventory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pr-3 font-semibold">Product</th>
              <th className="pb-3 px-3 font-semibold text-center">Current Stock</th>
              <th className="pb-3 px-3 font-semibold text-center">Min Threshold</th>
              <th className="pb-3 px-3 font-semibold text-center">Status</th>
              <th className="pb-3 pl-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Product */}
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200/60 flex-shrink-0"
                    />
                    <div>
                      <span className="font-bold text-slate-900 line-clamp-1 max-w-[150px] sm:max-w-[200px]" title={item.name}>
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{item.category}</span>
                    </div>
                  </div>
                </td>

                {/* Current Stock */}
                <td className="py-3 px-3 text-center">
                  <span className="font-black text-rose-600 text-sm bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                    {item.currentStock}
                  </span>
                </td>

                {/* Min Stock */}
                <td className="py-3 px-3 text-center font-bold text-slate-500">
                  {item.minStock} units
                </td>

                {/* Status */}
                <td className="py-3 px-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                      item.status === 'Critical'
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                {/* Update Stock Button */}
                <td className="py-3 pl-3 text-right">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 active:scale-95 text-brand-800 border border-brand-200 font-bold text-xs inline-flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-700" />
                    <span>Update Stock</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stock Replenishment Modal */}
      {selectedItem && (
        <StockUpdateModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSave={(id, newStock, newMin) => {
            onStockUpdated?.(id, newStock, newMin);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};
