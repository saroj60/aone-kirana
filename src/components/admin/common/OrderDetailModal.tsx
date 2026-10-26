import React from 'react';
import { X, ShoppingBag, MapPin, Phone, User, Calendar, CreditCard, Bike, CheckCircle2, Clock } from 'lucide-react';
import { Order } from '../../../data/mockData';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onUpdateStatus
}) => {
  if (!order) return null;

  const STATUS_FLOW: Order['status'][] = ['Placed', 'Packed', 'Out for Delivery', 'Delivered'];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Order #{order.orderNumber}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                order.status === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.status === 'Out for Delivery'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Placed on {order.createdAt || 'Just now'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customer & Delivery Brief */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-2">Customer Details</span>
            <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{order.customerPhone}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-2">Delivery Location</span>
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-brand-700 mt-0.5 flex-shrink-0" />
              <span className="font-medium leading-relaxed">{order.deliveryAddress}</span>
            </div>
          </div>
        </div>

        {/* Itemized Products List */}
        <div className="my-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Ordered Items ({order.items.length})</h4>
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-10 h-10 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200/60"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900">{item.product.name}</h5>
                    <p className="text-[11px] text-slate-400">
                      {item.product.unit} × {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900">
                    Rs. {item.product.price * item.quantity}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Rs. {item.product.price} each</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 my-4 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-bold text-slate-800">Rs. {order.subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Delivery Fee</span>
            <span className="font-bold text-slate-800">
              {order.deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : `Rs. ${order.deliveryFee}`}
            </span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200/80">
            <span>Total Amount</span>
            <span className="text-brand-800">Rs. {order.total}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            <span>Payment Method: <strong className="text-slate-800">{order.paymentMethod}</strong></span>
          </div>
        </div>

        {/* Status Actions */}
        <div className="pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Update Order Status</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Placed', 'Packed', 'Out for Delivery', 'Delivered'] as Order['status'][]).map(st => {
              const isCurrent = order.status === st;
              return (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(order.id, st)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition border ${
                    isCurrent
                      ? 'bg-brand-700 text-white border-brand-800 ring-2 ring-brand-200'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
