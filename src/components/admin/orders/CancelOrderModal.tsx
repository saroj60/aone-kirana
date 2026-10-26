import React, { useState } from 'react';
import { X, Ban, AlertTriangle } from 'lucide-react';
import { Order } from '../../../data/mockData';

interface CancelOrderModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirmCancel: (orderId: string, reason: string) => Promise<void>;
}

const COMMON_CANCEL_REASONS = [
  'Customer requested cancellation via phone call',
  'Customer unreachable / incorrect delivery address',
  'Items unavailable / warehouse out of stock',
  'Duplicate order placed accidentally',
  'Online payment authorization failed'
];

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  order,
  onClose,
  onConfirmCancel
}) => {
  const [selectedReason, setSelectedReason] = useState(COMMON_CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveReason = selectedReason === 'Other' ? customReason.trim() : selectedReason;
    if (!effectiveReason) {
      alert('Please state a reason for cancelling this order.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmCancel(order.id, effectiveReason);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Cancel Order #{order.orderNumber}</h3>
              <p className="text-[11px] text-slate-500">Customer: {order.customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-amber-800">
              <strong>Inventory Notice:</strong> Cancelling this order will automatically restore{' '}
              <span className="font-bold">{order.items.reduce((s, i) => s + i.quantity, 0)} items</span> back into warehouse stock.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Cancellation Reason
            </label>
            <div className="space-y-1.5">
              {COMMON_CANCEL_REASONS.map((r, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                    selectedReason === r
                      ? 'border-rose-400 bg-rose-50/50 font-bold text-slate-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancel_reason"
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{r}</span>
                </label>
              ))}

              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                  selectedReason === 'Other'
                    ? 'border-rose-400 bg-rose-50/50 font-bold text-slate-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="cancel_reason"
                  checked={selectedReason === 'Other'}
                  onChange={() => setSelectedReason('Other')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>Other custom reason</span>
              </label>
            </div>
          </div>

          {selectedReason === 'Other' && (
            <div>
              <textarea
                rows={2}
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="State reason for cancellation..."
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
