import React from 'react';
import { X, Tag, BarChart3, Users, DollarSign, Calendar, Clock, ShoppingBag } from 'lucide-react';
import { Coupon } from '../../../services/couponService';

interface CouponStatsModalProps {
  isOpen: boolean;
  coupon: Coupon | null;
  onClose: () => void;
}

export const CouponStatsModal: React.FC<CouponStatsModalProps> = ({
  isOpen,
  coupon,
  onClose
}) => {
  if (!isOpen || !coupon) return null;

  const usagePercent =
    coupon.usageLimit && coupon.usageLimit > 0
      ? Math.min(100, Math.round((coupon.usageCount / coupon.usageLimit) * 100))
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-slate-900 text-base">{coupon.code}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    coupon.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : coupon.status === 'expired'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {coupon.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{coupon.description}</p>
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Redemptions</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {coupon.usageCount}
                {coupon.usageLimit && (
                  <span className="text-xs font-semibold text-slate-400 ml-1">/ {coupon.usageLimit}</span>
                )}
              </div>
              {usagePercent !== null && (
                <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full transition-all"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Discount Given</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                Rs. {coupon.totalDiscountGiven.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Saved by customers</p>
            </div>
          </div>

          {/* Constraints snapshot */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Discount Type:</span>
              <span className="font-bold text-slate-800 capitalize">
                {coupon.discountType.replace('_', ' ')} ({coupon.discountValue}
                {coupon.discountType === 'percentage' || coupon.discountType === 'category_discount' ? '%' : ' Rs.'})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Minimum Order:</span>
              <span className="font-bold text-slate-800">Rs. {coupon.minOrder}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Max Discount Cap:</span>
              <span className="font-bold text-slate-800">{coupon.maxDiscount ? `Rs. ${coupon.maxDiscount}` : 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Per-User Limit:</span>
              <span className="font-bold text-slate-800">{coupon.perUserLimit} per customer</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Validity Period:</span>
              <span className="font-bold text-slate-800">
                {new Date(coupon.startDate).toLocaleDateString()} – {new Date(coupon.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Redemption History Table */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center justify-between">
              <span>Recent Redemptions Log</span>
              <span className="text-[11px] text-slate-400 font-normal">
                {(coupon.usedBy || []).length} recorded
              </span>
            </h4>

            {(!coupon.usedBy || coupon.usedBy.length === 0) ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200/80">
                <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                <p className="font-medium text-slate-600">No redemptions recorded yet</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  When customers use this promo code at checkout, redemptions will appear here.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Customer / Order</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Discount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coupon.usedBy.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-800">
                            {entry.orderNumber ? `#${entry.orderNumber}` : 'Online Checkout'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {entry.userPhone || entry.userEmail || entry.userId || 'Guest Customer'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-500">
                          {new Date(entry.usedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700">
                          -Rs. {entry.discountApplied}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
