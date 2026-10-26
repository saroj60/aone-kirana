import React from 'react';
import { Package, Clock, CheckCircle2, ChevronRight, RotateCcw, Truck } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useCart } from '../../context/CartContext';
import { Order } from '../../data/mockData';

interface OrdersViewProps {
  onTrackOrder: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onTrackOrder }) => {
  const { orders } = useOrders();
  const { addToCart, setIsCartOpen } = useCart();

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      addToCart(item.product, item.quantity);
    });
    setIsCartOpen(true);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Placed': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Packed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="px-4 py-3 pb-24 animate-fadeIn">
      <h2 className="text-xl font-bold text-slate-900 mb-1">Your Orders</h2>
      <p className="text-xs text-slate-500 mb-4">Track active deliveries and reorder grocery essentials</p>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No orders yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Order fresh groceries from Aone Kirana and track your delivery in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md transition"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-900">Order #{order.orderNumber}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{order.createdAt}</span>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Order Items Preview */}
              <div className="py-3 space-y-1">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-600">
                    <span className="truncate max-w-[220px]">
                      {item.quantity}x {item.product.name} ({item.product.unit})
                    </span>
                    <span className="font-semibold text-slate-800">
                      Rs. {item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <span className="text-[11px] text-slate-400 italic block">
                    +{order.items.length - 3} more items
                  </span>
                )}
              </div>

              {/* Total & Action Buttons */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Paid</span>
                  <span className="text-sm font-black text-slate-900">Rs. {order.total}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReorder(order)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reorder</span>
                  </button>

                  <button
                    onClick={() => onTrackOrder(order)}
                    className="px-3 py-1.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Live</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
