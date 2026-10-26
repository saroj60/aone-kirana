import React, { useState } from 'react';
import { X, CheckCircle2, Clock, Phone, MapPin, Truck, Package, ShoppingBag, ShieldCheck, ChevronDown, ChevronUp, Bike, Sparkles, Map } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { Order } from '../../data/mockData';
import { LiveDeliveryMap } from './LiveDeliveryMap';

interface OrderTrackingModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
  const { updateOrderStatus } = useOrders();
  const [isItemsExpanded, setIsItemsExpanded] = useState(false);

  const steps: { title: string; desc: string; key: Order['status'] }[] = [
    { title: 'Order Placed', desc: 'Received at Aone Kirana Hub', key: 'Placed' },
    { title: 'Packed & Sorted', desc: 'Fresh groceries verified & packed', key: 'Packed' },
    { title: 'Out for Delivery', desc: 'Rider en route from Tikathali', key: 'Out for Delivery' },
    { title: 'Delivered', desc: 'Handed over safely at doorstep', key: 'Delivered' }
  ];

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'Placed': return 0;
      case 'Packed': return 1;
      case 'Out for Delivery': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  const currentIdx = getStepIndex(order.status);

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn"
      style={{ zIndex: 1000 }}
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pr-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center text-brand-700 shadow-xs flex-shrink-0">
              <Truck className="w-6 h-6 text-brand-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  Live Order #{order.orderNumber}
                </h3>
                <span className="inline-flex items-center gap-1 bg-purple-100 text-brand-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-brand-700" />
                  GPS TRACKING
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {order.assignedStore ? `${order.assignedStore.storeName} (${order.assignedStore.distanceKm} km away) • Express Delivery` : 'Tikathali Central Store • Express Delivery in 20–35 Mins'}
              </p>
            </div>
          </div>

          {/* OpenStreetMap Badge */}
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-[11px] font-bold self-start sm:self-auto shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>OpenStreetMap Live</span>
          </div>
        </div>

        {/* 🗺️ INTERACTIVE OPENSTREETMAP LIVE GPS */}
        <div className="mb-5">
          <LiveDeliveryMap order={order} />
        </div>

        {/* 4-Step Order Progress Timeline */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 mb-4">
          <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
            Order Fulfillment Progress
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative">
            {steps.map((s, idx) => {
              const isCompleted = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div
                  key={s.key}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-purple-50/80 border-brand-300 ring-2 ring-purple-100'
                      : isCompleted
                      ? 'bg-white border-slate-200'
                      : 'bg-white/60 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-brand-700 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-bold truncate ${
                        isCurrent ? 'text-brand-900' : 'text-slate-800'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight line-clamp-1">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items Accordion / Summary */}
        <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setIsItemsExpanded(!isItemsExpanded)}
            className="w-full p-3.5 px-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition text-left"
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-700" />
              <span className="text-xs font-bold text-slate-800">
                Package Contents ({order.items.length} Items)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span>Rs. {order.total}</span>
              {isItemsExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>

          {isItemsExpanded && (
            <div className="p-4 space-y-2 border-t border-slate-100 max-h-48 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs text-slate-600">
                  <span className="truncate max-w-[260px]">
                    {item.quantity}x {item.product.name} ({item.product.unit})
                  </span>
                  <span className="font-semibold text-slate-900">
                    Rs. {item.product.price * item.quantity}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-extrabold text-slate-900">
                <span>Total Amount Paid ({order.paymentMethod}):</span>
                <span className="text-brand-700 font-black text-sm">Rs. {order.total}</span>
              </div>
            </div>
          )}
        </div>

        {/* Instant Support & Rider Contact Bar */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-brand-700 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 block text-[11px]">Need help with this order?</span>
              <span className="text-[10px] text-slate-500">Tikathali Central Store Support</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {order.riderPhone && (
              <a
                href={`tel:${order.riderPhone}`}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-[11px] transition shadow-xs flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>Call Rider</span>
              </a>
            )}
            <a
              href="tel:9841234567"
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-[11px] transition"
            >
              Call Store
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
