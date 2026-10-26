import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Sliders,
  AlertTriangle,
  CheckCircle,
  Package,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { InventoryItem, inventoryService } from '../../../services/inventoryService';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  mode?: 'stock_in' | 'stock_out' | 'adjust';
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const STOCK_IN_REASONS = [
  'Supplier Wholesale Restock',
  'Kalimati / Local Mandi Fresh Batch',
  'Customer Order Return / Cancellation',
  'Warehouse Inter-Branch Transfer',
  'Bonus / Vendor Free Sample'
];

const STOCK_OUT_REASONS = [
  'Daily Storefront & Online Sales Dispatch',
  'Decomposed / Spoiled Produce Discarded',
  'Damaged / Broken Packaging',
  'Expired Shelf-life Write-off',
  'Internal Store Usage / Tasting Sample'
];

const ADJUST_REASONS = [
  'Physical Inventory Stocktake Count',
  'Inventory Shrinkage Reconciliation',
  'System Barcode Discrepancy Correction',
  'Opening Stock Calibration'
];

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  item,
  mode = 'stock_in',
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'stock_in' | 'stock_out' | 'adjust'>(mode);
  const [quantity, setQuantity] = useState<number | ''>(10);
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [allowNegativeStock, setAllowNegativeStock] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(mode);
    setQuantity(mode === 'adjust' && item ? item.currentStock : 10);
    setReason('');
    setCustomReason('');
    setNotes('');
    setAllowNegativeStock(false);
    setErrorMessage(null);
  }, [mode, item, isOpen]);

  if (!isOpen || !item) return null;

  const currentStock = item.currentStock;
  const numQty = typeof quantity === 'number' ? quantity : 0;

  // Calculate projected new stock
  let projectedNewStock = currentStock;
  if (activeTab === 'stock_in') {
    projectedNewStock = currentStock + numQty;
  } else if (activeTab === 'stock_out') {
    projectedNewStock = currentStock - numQty;
  } else {
    projectedNewStock = numQty;
  }

  const willBeNegative = projectedNewStock < 0;

  const handleTabChange = (tab: 'stock_in' | 'stock_out' | 'adjust') => {
    setActiveTab(tab);
    setErrorMessage(null);
    if (tab === 'adjust') {
      setQuantity(item.currentStock);
    } else {
      setQuantity(10);
    }
    setReason('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const effectiveReason = (reason === 'Other' || !reason ? customReason : reason).trim();
    if (!effectiveReason) {
      setErrorMessage('Please specify a valid reason for this inventory update.');
      return;
    }

    if (numQty <= 0 && activeTab !== 'adjust') {
      setErrorMessage('Quantity must be greater than zero.');
      return;
    }

    if (willBeNegative && !allowNegativeStock) {
      setErrorMessage(
        `Negative stock prevented! Decreasing by ${numQty} would cause stock to drop to ${projectedNewStock}. Enable override below if intentional.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === 'stock_in') {
        const res = await inventoryService.stockIn({
          productId: item.productId,
          quantity: numQty,
          reason: effectiveReason,
          notes
        });
        onSuccess(
          `Added +${numQty} ${item.unit} to ${item.name}. New available stock: ${res.item.currentStock}`
        );
      } else if (activeTab === 'stock_out') {
        const res = await inventoryService.stockOut({
          productId: item.productId,
          quantity: numQty,
          reason: effectiveReason,
          notes,
          allowNegativeStock
        });
        onSuccess(
          `Deducted -${numQty} ${item.unit} from ${item.name}. New available stock: ${res.item.currentStock}`
        );
      } else {
        const res = await inventoryService.adjustStock({
          productId: item.productId,
          newQuantity: numQty,
          reason: effectiveReason,
          notes,
          allowNegativeStock
        });
        onSuccess(
          `Adjusted ${item.name} stock to ${res.item.currentStock} ${item.unit}.`
        );
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update inventory. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetReasons =
    activeTab === 'stock_in'
      ? STOCK_IN_REASONS
      : activeTab === 'stock_out'
      ? STOCK_OUT_REASONS
      : ADJUST_REASONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <img
              src={item.image}
              alt={item.name}
              className="w-11 h-11 rounded-2xl bg-white border border-slate-200/80 p-1 object-contain shrink-0 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                <span className="text-[10px] font-mono bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
                  {item.sku}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Current Available Stock: <strong className="text-slate-700">{item.currentStock} {item.unit}</strong>
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

        {/* Mode Selector Tabs */}
        <div className="p-4 bg-slate-100/70 border-b border-slate-200/80">
          <div className="grid grid-cols-3 gap-2 bg-slate-200/80 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTabChange('stock_in')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'stock_in'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Stock In</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('stock_out')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'stock_out'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Stock Out</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('adjust')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'adjust'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Adjust</span>
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Stock Calculation Preview Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Previous</span>
              <span className="text-base font-black text-slate-800">{currentStock}</span>
              <span className="text-[10px] text-slate-400 block">{item.unit}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400">
                {activeTab === 'stock_in' ? `+${numQty}` : activeTab === 'stock_out' ? `-${numQty}` : 'Set to'}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Projected New</span>
              <span
                className={`text-base font-black ${
                  projectedNewStock < 0
                    ? 'text-rose-600'
                    : projectedNewStock <= item.minStock
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {projectedNewStock}
              </span>
              <span className="text-[10px] text-slate-400 block">{item.unit}</span>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {activeTab === 'adjust' ? 'Exact New Stock Count *' : 'Quantity to Change *'}
            </label>
            <div className="relative">
              <input
                type="number"
                min={allowNegativeStock ? undefined : 0}
                value={quantity}
                onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Enter quantity"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {item.unit}
              </span>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Update *
            </label>
            <div className="space-y-1.5 mb-2">
              {presetReasons.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setReason(r);
                    setCustomReason('');
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition ${
                    reason === r
                      ? 'bg-brand-50 border-brand-500 text-brand-800 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={customReason}
              onChange={e => {
                setCustomReason(e.target.value);
                setReason('Other');
              }}
              placeholder="Or enter custom reason..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          {/* Internal Admin Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Internal Audit Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Batch number, invoice reference, supplier receipt ID..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white resize-none"
            />
          </div>

          {/* Negative Stock Prevention Override Checkbox */}
          {(willBeNegative || activeTab === 'stock_out') && (
            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowNegativeStock}
                  onChange={e => setAllowNegativeStock(e.target.checked)}
                  className="mt-0.5 rounded border-amber-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    Allow negative stock override
                  </span>
                  <span className="text-[11px] text-amber-700 block">
                    By default, the system prevents inventory from going below 0. Check only if you need to fulfill backorders before receiving stock.
                  </span>
                </div>
              </label>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition disabled:opacity-50 ${
              activeTab === 'stock_in'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : activeTab === 'stock_out'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-brand-700 hover:bg-brand-800'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Recording...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>
                  {activeTab === 'stock_in'
                    ? 'Confirm Stock In'
                    : activeTab === 'stock_out'
                    ? 'Confirm Stock Out'
                    : 'Save Stock Adjustment'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
