import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  Phone,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Order, DeliveryPerson } from '../../../data/mockData';
import { adminService, AdminRider } from '../../../services/adminService';

interface AssignRiderModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onAssign: (orderId: string, rider: DeliveryPerson) => Promise<void>;
}

export const AssignRiderModal: React.FC<AssignRiderModalProps> = ({
  isOpen,
  order,
  onClose,
  onAssign
}) => {
  const [riders, setRiders] = useState<AdminRider[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      adminService.getRiders().then(list => {
        setRiders(list);
        if (order?.deliveryPerson?.id) {
          setSelectedRiderId(order.deliveryPerson.id);
        } else if (list.length > 0) {
          const available = list.find(r => r.status === 'Available') || list[0];
          setSelectedRiderId(available.id);
        }
      });
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleConfirm = async () => {
    const selected = riders.find(r => r.id === selectedRiderId);
    if (!selected) return;

    setIsSubmitting(true);
    try {
      await onAssign(order.id, {
        id: selected.id,
        name: selected.name,
        phone: selected.phone,
        vehicle: selected.vehicle
      });
      onClose();
    } catch (e) {
      alert('Failed to assign rider');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Assign Delivery Partner</h3>
              <p className="text-[11px] text-slate-400">Order #{order.orderNumber} • {order.customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Riders List */}
        <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
          {riders.map(r => {
            const isSelected = selectedRiderId === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRiderId(r.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
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
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
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
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{r.phone}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      {r.vehicle}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold justify-end">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{r.rating}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">
                    {r.activeOrders} active
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
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/50 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};
