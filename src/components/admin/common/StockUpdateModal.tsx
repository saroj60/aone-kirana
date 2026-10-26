import React, { useState } from 'react';
import { X, Package, Check, AlertTriangle } from 'lucide-react';
import { LowStockItem } from '../../../services/adminService';

interface StockUpdateModalProps {
  item: LowStockItem | null;
  onClose: () => void;
  onSave: (itemId: string, newStock: number, newMinStock: number) => void;
}

export const StockUpdateModal: React.FC<StockUpdateModalProps> = ({
  item,
  onClose,
  onSave
}) => {
  if (!item) return null;

  const [stock, setStock] = useState<number>(item.currentStock);
  const [minStock, setMinStock] = useState<number>(item.minStock);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item.id, stock, minStock);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Update Stock Level</h3>
              <p className="text-[11px] text-slate-400">Aone Kirana Inventory Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Brief */}
        <div className="flex items-center gap-3 my-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <img
            src={item.image}
            alt={item.name}
            className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-200/60"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
            <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
              {item.category}
            </span>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Current Available Stock (Units)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStock(Math.max(0, stock - 5))}
                className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
              >
                -5
              </button>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={e => setStock(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 text-center focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                required
              />
              <button
                type="button"
                onClick={() => setStock(stock + 10)}
                className="px-2.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-xs font-bold text-brand-700 transition"
              >
                +10
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Minimum Threshold Alert (Units)
            </label>
            <input
              type="number"
              min="1"
              value={minStock}
              onChange={e => setMinStock(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">Alerts dashboard when stock falls below this number.</p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
