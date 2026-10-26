import React from 'react';
import { OrderStatusSummary } from '../../../services/adminService';
import { Sparkles, CheckCircle, Clock, PackageCheck, Bike, CheckCheck, XCircle } from 'lucide-react';

interface OrderStatusCardsProps {
  summary: OrderStatusSummary[];
  selectedStatus?: string | null;
  onSelectStatus?: (status: string | null) => void;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  'New': <Sparkles className="w-4 h-4 text-blue-500" />,
  'Confirmed': <CheckCircle className="w-4 h-4 text-indigo-500" />,
  'Preparing': <Clock className="w-4 h-4 text-amber-500" />,
  'Ready': <PackageCheck className="w-4 h-4 text-teal-500" />,
  'Out for Delivery': <Bike className="w-4 h-4 text-orange-500" />,
  'Delivered': <CheckCheck className="w-4 h-4 text-emerald-600" />,
  'Cancelled': <XCircle className="w-4 h-4 text-rose-500" />
};

const STATUS_THEMES: Record<string, { bg: string; border: string; activeRing: string; countColor: string }> = {
  'New': { bg: 'bg-blue-50/50', border: 'border-blue-200/70', activeRing: 'ring-blue-400 border-blue-500', countColor: 'text-blue-700' },
  'Confirmed': { bg: 'bg-indigo-50/50', border: 'border-indigo-200/70', activeRing: 'ring-indigo-400 border-indigo-500', countColor: 'text-indigo-700' },
  'Preparing': { bg: 'bg-amber-50/50', border: 'border-amber-200/70', activeRing: 'ring-amber-400 border-amber-500', countColor: 'text-amber-700' },
  'Ready': { bg: 'bg-teal-50/50', border: 'border-teal-200/70', activeRing: 'ring-teal-400 border-teal-500', countColor: 'text-teal-700' },
  'Out for Delivery': { bg: 'bg-orange-50/50', border: 'border-orange-200/70', activeRing: 'ring-orange-400 border-orange-500', countColor: 'text-orange-700' },
  'Delivered': { bg: 'bg-emerald-50/50', border: 'border-emerald-200/70', activeRing: 'ring-emerald-400 border-emerald-500', countColor: 'text-emerald-700' },
  'Cancelled': { bg: 'bg-rose-50/50', border: 'border-rose-200/70', activeRing: 'ring-rose-400 border-rose-500', countColor: 'text-rose-700' }
};

export const OrderStatusCards: React.FC<OrderStatusCardsProps> = ({
  summary,
  selectedStatus,
  onSelectStatus
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Order Fulfillment Pipeline</h3>
          <p className="text-xs text-slate-400">Live order status progression & operational backlog</p>
        </div>
        {selectedStatus && (
          <button
            onClick={() => onSelectStatus?.(null)}
            className="text-xs font-bold text-brand-700 hover:text-brand-800 underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {summary.map(item => {
          const theme = STATUS_THEMES[item.status] || {
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            activeRing: 'ring-slate-400',
            countColor: 'text-slate-800'
          };
          const isSelected = selectedStatus === item.status;

          return (
            <div
              key={item.status}
              onClick={() => onSelectStatus?.(isSelected ? null : item.status)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${theme.bg} ${theme.border} ${
                isSelected ? `ring-2 ${theme.activeRing} shadow-sm` : 'hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1 rounded-lg bg-white/80 shadow-2xs">
                  {STATUS_ICONS[item.status]}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{item.percentage}%</span>
              </div>

              <div>
                <span className={`text-xl font-black block ${theme.countColor}`}>
                  {item.count}
                </span>
                <span className="text-xs font-bold text-slate-700 line-clamp-1">
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
