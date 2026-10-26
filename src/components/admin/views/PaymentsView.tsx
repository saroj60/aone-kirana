import React from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const TRANSACTIONS = [
    { id: 'txn-101', order: 'AK-8924', method: 'eSewa', amount: 1250, status: 'Settled', time: 'Today, 10:45 AM', ref: 'ESW-99120482' },
    { id: 'txn-102', order: 'AK-8923', method: 'Fonepay', amount: 890, status: 'Settled', time: 'Today, 09:30 AM', ref: 'FNP-10492831' },
    { id: 'txn-103', order: 'AK-8922', method: 'Cash on Delivery', amount: 2400, status: 'Pending Collection', time: 'Today, 09:15 AM', ref: 'COD-RIDER-BIKASH' },
    { id: 'txn-104', order: 'AK-8921', method: 'Khalti', amount: 620, status: 'Settled', time: 'Yesterday, 06:12 PM', ref: 'KHL-49102948' },
    { id: 'txn-105', order: 'AK-8920', method: 'Fonepay', amount: 1750, status: 'Settled', time: 'Yesterday, 04:40 PM', ref: 'FNP-88392019' }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-700" />
            <span>Payments & Gateway Settlements</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Live settlements across eSewa, Khalti, Fonepay, and COD</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-400 font-bold block">eSewa Received</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">Rs. 42,800</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-400 font-bold block">Fonepay Received</span>
          <span className="text-xl font-black text-blue-700 mt-1 block">Rs. 38,400</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-400 font-bold block">Khalti Received</span>
          <span className="text-xl font-black text-purple-700 mt-1 block">Rs. 19,200</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-400 font-bold block">COD Pending</span>
          <span className="text-xl font-black text-amber-700 mt-1 block">Rs. 8,650</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pr-3 font-semibold">Txn ID</th>
              <th className="pb-3 px-3 font-semibold">Order</th>
              <th className="pb-3 px-3 font-semibold">Payment Gateway</th>
              <th className="pb-3 px-3 font-semibold text-right">Amount</th>
              <th className="pb-3 px-3 font-semibold text-center">Status</th>
              <th className="pb-3 pl-3 font-semibold text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {TRANSACTIONS.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 pr-3 font-bold text-slate-900 font-mono">{t.id}</td>
                <td className="py-3 px-3 font-bold text-brand-800">#{t.order}</td>
                <td className="py-3 px-3">
                  <span className="font-bold text-slate-800">{t.method}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{t.ref}</span>
                </td>
                <td className="py-3 px-3 text-right font-black text-slate-900">
                  Rs. {t.amount}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    t.status === 'Settled' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="py-3 pl-3 text-right text-slate-500 text-[11px]">{t.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
