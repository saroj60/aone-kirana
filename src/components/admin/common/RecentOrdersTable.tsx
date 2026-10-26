import React, { useState } from 'react';
import { Order } from '../../../data/mockData';
import { ShoppingBag, Eye, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';
import { OrderDetailModal } from './OrderDetailModal';

interface RecentOrdersTableProps {
  orders: Order[];
  onUpdateStatus?: (orderId: string, status: Order['status']) => void;
  onViewAllOrders?: () => void;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  orders,
  onUpdateStatus,
  onViewAllOrders
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Out for Delivery':
        return 'bg-orange-50 text-orange-700 border-orange-200/60';
      case 'Packed':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'Placed':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <ShoppingBag className="w-5 h-5 text-brand-700" />
            <span>Recent Customer Orders</span>
          </h3>
          <p className="text-xs text-slate-400">Live incoming grocery deliveries in Tikathali hub</p>
        </div>

        {onViewAllOrders && (
          <button
            onClick={onViewAllOrders}
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            <span>All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pr-3 font-semibold">Order ID</th>
              <th className="pb-3 px-3 font-semibold">Customer</th>
              <th className="pb-3 px-3 font-semibold">Items</th>
              <th className="pb-3 px-3 font-semibold text-right">Amount</th>
              <th className="pb-3 px-3 font-semibold">Payment</th>
              <th className="pb-3 px-3 font-semibold text-center">Status</th>
              <th className="pb-3 px-3 font-semibold">Date/Time</th>
              <th className="pb-3 pl-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {orders.map(order => {
              const itemsCount = order.items.reduce((s, i) => s + i.quantity, 0);
              const itemsPreview = order.items.map(i => i.product.name).join(', ');

              return (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Order ID */}
                  <td className="py-3 pr-3 font-extrabold text-slate-900">
                    #{order.orderNumber}
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800 block truncate max-w-[130px]" title={order.customerName}>
                      {order.customerName}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                      {order.customerPhone}
                    </span>
                  </td>

                  {/* Items */}
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-700 block">
                      {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[140px]" title={itemsPreview}>
                      {itemsPreview}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-3 font-black text-slate-900 text-right">
                    Rs. {order.total}
                  </td>

                  {/* Payment */}
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {order.paymentMethod}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  {/* Date/Time */}
                  <td className="py-3 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                    {order.createdAt || 'Just now'}
                  </td>

                  {/* View Button */}
                  <td className="py-3 pl-3 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-800 active:scale-95 text-slate-600 font-bold text-xs inline-flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Order Detail Inspector Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={(id, st) => {
            onUpdateStatus?.(id, st);
            setSelectedOrder(prev => (prev ? { ...prev, status: st } : null));
          }}
        />
      )}
    </div>
  );
};
