import React, { useState } from 'react';
import { X, Truck, Phone, Star, CheckCircle } from 'lucide-react';
import { DeliveryOrder, DeliveryPerson } from '../../../services/deliveryService';

interface DispatchOrderModalProps {
  isOpen: boolean;
  order: DeliveryOrder | null;
  riders: DeliveryPerson[];
  onClose: () => void;
  onConfirm: (orderId: string, riderId: string) => Promise<void>;
}

export const DispatchOrderModal: React.FC<DispatchOrderModalProps> = ({
  isOpen,
  order,
  riders,
  onClose,
  onConfirm
}) => {
  const [selectedRiderId, setSelectedRiderId] = useState<string>(
    riders.find(r => r.status === 'Available')?.id || (riders[0]?.id ?? '')
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleDispatch = async () => {
    if (!selectedRiderId) return;
    setIsSubmitting(true);
    try {
      await onConfirm(order.id, selectedRiderId);
      onClose();
    } catch (e) {
      alert('Failed to dispatch order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Dispatch Order #{order.orderNumber}</h3>
              <p className="text-[11px] text-slate-400">Customer: {order.customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Brief */}
        <div className="p-4 mx-6 mt-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1">
          <div className="flex justify-between font-bold text-slate-800">
            <span>{order.customerName}</span>
            <span className="text-brand-700">Rs. {order.total}</span>
          </div>
          <p className="text-slate-500">{order.deliveryAddress}</p>
          <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
            <span>Zone: {order.zone}</span>
            <span>{order.itemsCount} Items</span>
          </div>
        </div>

        {/* Select Rider */}
        <div className="p-6 space-y-2.5 max-h-72 overflow-y-auto">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Choose Delivery Partner
          </label>

          {riders.map(r => {
            const isSelected = selectedRiderId === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRiderId(r.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 text-xs ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-100'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>

                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{r.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                          r.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{r.vehicle}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500 font-bold justify-end">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{r.rating}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {r.currentAssignedOrders.length} active
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDispatch}
            disabled={isSubmitting}
            className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50"
          >
            {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};
