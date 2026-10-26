import React from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  Printer,
  Ban,
  ArrowRight,
  Package,
  Layers,
  ChevronRight,
  AlertCircle,
  Store
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../../data/mockData';

interface OrderDetailsModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onAdvanceStatus: (order: Order, nextStatus: OrderStatus) => void;
  onOpenCancel: (order: Order) => void;
  onOpenAssignRider: (order: Order) => void;
  onOpenPrintInvoice: (order: Order) => void;
  onUpdatePaymentStatus: (orderId: string, status: PaymentStatus) => void;
}

const STATUS_FLOW: OrderStatus[] = [
  'New',
  'Confirmed',
  'Preparing',
  'Ready for Delivery',
  'Out for Delivery',
  'Delivered'
];

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  order,
  onClose,
  onAdvanceStatus,
  onOpenCancel,
  onOpenAssignRider,
  onOpenPrintInvoice,
  onUpdatePaymentStatus
}) => {
  if (!isOpen || !order) return null;

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';
  const isDelivered = order.status === 'Delivered';

  const nextStatus = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIndex + 1]
    : null;

  const nextActionLabels: Record<string, string> = {
    Confirmed: 'Confirm Order',
    Preparing: 'Start Preparing',
    'Ready for Delivery': 'Mark Ready for Delivery',
    'Out for Delivery': 'Dispatch / Out for Delivery',
    Delivered: 'Mark Delivered'
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Confirmed': return 'bg-indigo-100 text-indigo-800';
      case 'Preparing': return 'bg-amber-100 text-amber-800';
      case 'Ready for Delivery': return 'bg-purple-100 text-purple-800';
      case 'Out for Delivery': return 'bg-orange-100 text-orange-800';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800';
      case 'Cancelled': return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Order #{order.orderNumber}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrintInvoice(order)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              title="Print Customer Invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Order Status Timeline Stepper */}
          {!isCancelled ? (
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-3">
                Order Lifecycle Flow
              </h4>
              <div className="flex items-center justify-between relative">
                {STATUS_FLOW.map((step, idx) => {
                  const isCompleted = currentIndex >= idx;
                  const isCurrent = currentIndex === idx;

                  return (
                    <div key={step} className="flex-1 flex flex-col items-center text-center relative z-10">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors ${
                          isCompleted
                            ? 'bg-brand-700 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-500'
                        } ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}
                      >
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] mt-1.5 font-bold max-w-[70px] leading-tight ${
                          isCurrent
                            ? 'text-brand-800 font-extrabold'
                            : isCompleted
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
                {/* Connecting track line */}
                <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-slate-200 -z-0" />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold text-rose-800 text-xs block">Order Cancelled</span>
                <span className="text-[11px] text-rose-600 block mt-0.5">
                  Reason: {order.cancellationReason || 'Cancelled by admin'}
                </span>
              </div>
            </div>
          )}

          {/* Customer & Delivery Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 pb-2 border-b border-slate-200">
                <User className="w-4 h-4 text-brand-700" />
                <span>Customer Information</span>
              </div>
              <div className="space-y-1 pt-1 text-slate-600">
                <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                <p className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${order.customerPhone}`} className="hover:text-brand-700 font-semibold">
                    {order.customerPhone}
                  </a>
                </p>
                {order.customerEmail && (
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.customerEmail}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 pb-2 border-b border-slate-200">
                <MapPin className="w-4 h-4 text-brand-700" />
                <span>Delivery Address</span>
              </div>
              <div className="space-y-1 pt-1 text-slate-600">
                <p className="font-medium text-slate-900">{order.deliveryAddress}</p>
                {order.deliveryNotes && (
                  <p className="text-[11px] text-slate-500 italic mt-1 bg-white p-2 rounded-xl border border-slate-100">
                    "Note: {order.deliveryNotes}"
                  </p>
                )}
              </div>
            </div>

            {/* Fulfillment Single Store Hub */}
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 pb-2 border-b border-slate-200">
                <Store className="w-4 h-4 text-brand-700" />
                <span>Fulfillment Store (Single Hub)</span>
              </div>
              <div className="space-y-1 pt-1 text-slate-600">
                <p className="font-semibold text-slate-900">
                  {order.assignedStore?.storeName || 'Aone Kirana Central Store'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {order.assignedStore?.storeAddress || 'Tikathali Chowk, Ward 5, Mahalaxmi, Lalitpur'}
                </p>
                {typeof order.assignedStore?.distanceKm === 'number' && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-md">
                    Delivery Distance: {order.assignedStore.distanceKm} km
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Rider Assignment Banner */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Assigned Delivery Partner
                </span>
                {order.deliveryPerson || order.riderName ? (
                  <div className="font-bold text-slate-900">
                    {order.deliveryPerson?.name || order.riderName}{' '}
                    <span className="text-slate-400 font-normal">
                      ({order.deliveryPerson?.vehicle || 'Bike Rider'}) • {order.deliveryPerson?.phone || order.riderPhone}
                    </span>
                  </div>
                ) : (
                  <span className="font-medium text-amber-700 italic">No delivery rider assigned yet</span>
                )}
              </div>
            </div>

            {!isCancelled && !isDelivered && (
              <button
                type="button"
                onClick={() => onOpenAssignRider(order)}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-brand-700 border border-slate-200 rounded-xl font-bold transition self-start sm:self-auto shadow-2xs"
              >
                {order.deliveryPerson || order.riderName ? 'Reassign Rider' : 'Assign Rider'}
              </button>
            )}
          </div>

          {/* Ordered Products Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 border-b border-slate-200 flex items-center justify-between">
              <span>Ordered Products ({order.items.length})</span>
              <span className="text-[11px] text-slate-400">Unit Price & Subtotal</span>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items.map((item: any, idx: number) => {
                const prod = item.product || {};
                const name = prod.name || item.name || 'Product';
                const image = prod.image || item.image || '/logo.png';
                const unit = prod.unit || item.unit || '1 pc';
                const price = prod.price !== undefined ? prod.price : item.price || 0;
                const qty = item.quantity || 1;

                return (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                    <div className="flex items-center gap-3">
                      <img
                        src={image}
                        alt={name}
                        className="w-10 h-10 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200/80 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{name}</div>
                        <div className="text-[11px] text-slate-400">
                          {unit} • Rs. {price} each
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-slate-900">
                        Rs. {price * qty}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold">
                        Qty: {qty}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50/80 p-4 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>Rs. {order.subtotal}</span>
              </div>
              {order.discount ? (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Special Discount</span>
                  <span>- Rs. {order.discount}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-slate-500">
                <span>Delivery Charge</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `Rs. ${order.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 text-sm pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-brand-700">Rs. {order.total}</span>
              </div>
            </div>
          </div>

          {/* Payment Method & Payment Status */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Payment Information
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-slate-900">{order.paymentMethod}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    order.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.paymentStatus === 'Failed'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>

            {order.paymentStatus !== 'Paid' && !isCancelled && (
              <button
                type="button"
                onClick={() => onUpdatePaymentStatus(order.id, 'Paid')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-2xs"
              >
                Mark as Paid
              </button>
            )}
          </div>

          {/* Timeline Audit Log */}
          {order.orderTimeline && order.orderTimeline.length > 0 && (
            <div className="border border-slate-200 rounded-2xl p-4">
              <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Order Activity Timeline</span>
              </h4>
              <div className="space-y-2 text-xs">
                {order.orderTimeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-brand-600 mt-1 shrink-0" />
                    <div className="flex-1">
                      <span className="font-bold text-slate-800">{item.status}:</span>{' '}
                      <span className="text-slate-600">{item.note}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            {!isCancelled && !isDelivered && (
              <button
                type="button"
                onClick={() => onOpenCancel(order)}
                className="px-4 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel Order</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200/60 rounded-xl text-xs font-bold transition"
            >
              Close
            </button>

            {nextStatus && (
              <button
                type="button"
                onClick={() => onAdvanceStatus(order, nextStatus)}
                className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <span>{nextActionLabels[nextStatus] || `Move to ${nextStatus}`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
