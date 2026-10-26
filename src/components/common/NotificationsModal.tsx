import React from 'react';
import { X, Bell, Clock, Tag, ShoppingBag } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';

export const NotificationsModal: React.FC = () => {
  const { isNotificationsOpen, setIsNotificationsOpen, orders } = useOrders();

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" style={{ zIndex: 1000 }}>
      <div className="w-full sm:max-w-md bg-white rounded-2xl p-5 shadow-2xl mt-12 sm:mt-0 transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">Updates & Store Announcements</p>
            </div>
          </div>
          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 max-h-[360px] overflow-y-auto">
          {orders.length > 0 && (
            <div className="p-3 bg-brand-50/60 border border-brand-200 rounded-xl flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-900">Order {orders[0].orderNumber} Status</span>
                  <span className="text-[10px] text-slate-400">10m ago</span>
                </div>
                <p className="text-slate-600 mt-0.5">
                  Your grocery delivery is currently <span className="font-semibold text-brand-700">{orders[0].status}</span>.
                </p>
              </div>
            </div>
          )}

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900">20% Flash Discount!</span>
                <span className="text-[10px] text-slate-400">1h ago</span>
              </div>
              <p className="text-slate-600 mt-0.5">
                Up to 20% OFF on all daily cooking essentials & fresh vegetables in Tikathali.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Fast 30-min Delivery Active</span>
                <span className="text-[10px] text-slate-400">Today</span>
              </div>
              <p className="text-slate-600 mt-0.5">
                Riders are ready in Tikathali & Sanagaun zone for quick delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
