import React from 'react';
import { Bell, CheckCheck, AlertCircle, ShoppingBag, Truck } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const NOTIFICATIONS = [
    { id: 'nt-1', title: 'New Order Received', desc: 'Order #AK-8924 placed by Saroj Shrestha for Rs. 1,250', time: '5 mins ago', type: 'order' },
    { id: 'nt-2', title: 'Low Stock Alert', desc: 'Fortune Sunflower Oil (1 L) has reached critical stock (3 units left)', time: '20 mins ago', type: 'alert' },
    { id: 'nt-3', title: 'Order Dispatched', desc: 'Rider Ramesh departed with order #AK-8922 to Sanagaun', time: '45 mins ago', type: 'delivery' },
    { id: 'nt-4', title: 'Daily Settlement Ready', desc: 'eSewa & Fonepay daily batch settled to bank account ending in 4921', time: '2 hours ago', type: 'finance' }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-700" />
            <span>Operational Store Alerts</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time alerts for incoming orders, inventory shortages, and payments</p>
        </div>

        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto">
          <CheckCheck className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs divide-y divide-slate-100">
        {NOTIFICATIONS.map(n => (
          <div key={n.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-3.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
              n.type === 'order'
                ? 'bg-blue-50 text-blue-700'
                : n.type === 'alert'
                ? 'bg-rose-50 text-rose-700'
                : n.type === 'delivery'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}>
              {n.type === 'order' && <ShoppingBag className="w-4 h-4" />}
              {n.type === 'alert' && <AlertCircle className="w-4 h-4" />}
              {n.type === 'delivery' && <Truck className="w-4 h-4" />}
              {n.type === 'finance' && <Bell className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{n.title}</h4>
                <span className="text-[10px] text-slate-400">{n.time}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
