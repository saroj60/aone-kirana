import React, { useState } from 'react';
import { X, MapPin, Check, Sliders, DollarSign, Clock } from 'lucide-react';
import { DeliveryZone, deliveryService } from '../../../services/deliveryService';

interface ZoneSettingsModalProps {
  isOpen: boolean;
  zone: DeliveryZone | null;
  onClose: () => void;
  onSuccess: (updated: DeliveryZone) => void;
}

export const ZoneSettingsModal: React.FC<ZoneSettingsModalProps> = ({
  isOpen,
  zone,
  onClose,
  onSuccess
}) => {
  if (!isOpen || !zone) return null;

  const [name, setName] = useState(zone.name);
  const [radiusKm, setRadiusKm] = useState(zone.radiusKm);
  const [baseFee, setBaseFee] = useState(zone.baseFee);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(zone.freeDeliveryThreshold);
  const [estimatedTime, setEstimatedTime] = useState(zone.estimatedTime);
  const [isActive, setIsActive] = useState(zone.isActive);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await deliveryService.updateZone(zone.id, {
        name,
        radiusKm: Number(radiusKm),
        baseFee: Number(baseFee),
        freeDeliveryThreshold: Number(freeDeliveryThreshold),
        estimatedTime,
        isActive
      });
      onSuccess(updated);
      onClose();
    } catch (e: any) {
      alert(e?.message || 'Failed to update zone');
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
            <div className="w-9 h-9 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Configure Delivery Zone</h3>
              <p className="text-[11px] text-slate-400">Radius, delivery fee and free order threshold</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Zone Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Delivery Radius (km)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="25"
                required
                value={radiusKm}
                onChange={e => setRadiusKm(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Standard Fee (Rs.)
              </label>
              <input
                type="number"
                min="0"
                required
                value={baseFee}
                onChange={e => setBaseFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Free Delivery Above (Rs.)
              </label>
              <input
                type="number"
                min="0"
                required
                value={freeDeliveryThreshold}
                onChange={e => setFreeDeliveryThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Est. Duration
              </label>
              <input
                type="text"
                required
                value={estimatedTime}
                onChange={e => setEstimatedTime(e.target.value)}
                placeholder="e.g. 25-35 mins"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="font-bold text-slate-800">Zone Enabled for Local Delivery</span>
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
