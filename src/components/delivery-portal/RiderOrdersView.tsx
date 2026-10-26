import React, { useState } from 'react';
import {
  DeliveryOrder,
  DeliveryPerson,
  deliveryService,
  OrderDeliveryStatus
} from '../../services/deliveryService';
import {
  Phone,
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  Banknote,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Store,
  Bike,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface RiderOrdersViewProps {
  rider: DeliveryPerson;
  onOrderUpdated: () => void;
}

export const RiderOrdersView: React.FC<RiderOrdersViewProps> = ({ rider, onOrderUpdated }) => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Delivery confirmation modal for COD cash collection
  const [confirmingOrder, setConfirmingOrder] = useState<DeliveryOrder | null>(null);
  const [cashCollected, setCashCollected] = useState(true);

  // Failure reporting modal
  const [failingOrder, setFailingOrder] = useState<DeliveryOrder | null>(null);
  const [failureReason, setFailureReason] = useState('Customer phone unreachable');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const riderOrders = await deliveryService.getRiderOrders(rider.id);
      // Filter active trips first, completed last
      const active = riderOrders.filter(o => o.deliveryStatus !== 'Delivered' && o.deliveryStatus !== 'Failed');
      setOrders(active);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadOrders();
  }, [rider.id]);

  const handleUpdateStatus = async (order: DeliveryOrder, nextStatus: OrderDeliveryStatus, reason?: string) => {
    setUpdatingId(order.id);
    try {
      await deliveryService.updateStatus(order.id, nextStatus, reason);
      await loadOrders();
      onOrderUpdated();
    } finally {
      setUpdatingId(null);
      setConfirmingOrder(null);
      setFailingOrder(null);
    }
  };

  const getStatusBadge = (status: OrderDeliveryStatus) => {
    switch (status) {
      case 'Assigned':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 text-[11px] font-extrabold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Assigned to You</span>
          </span>
        );
      case 'Picked Up':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 text-[11px] font-extrabold flex items-center gap-1">
            <Store className="w-3 h-3" />
            <span>Picked Up from Store</span>
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 text-[11px] font-extrabold flex items-center gap-1 animate-pulse">
            <Bike className="w-3 h-3 text-brand-700" />
            <span>Out for Delivery</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  const openOpenStreetMap = (address: string) => {
    const full = `${address}, Lalitpur, Nepal`;
    window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(full)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Active Tasks Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>My Active Deliveries</span>
            <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 text-xs font-black">
              {orders.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Fulfill and update customer delivery status in real-time
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-brand-700 hover:border-brand-300 transition shadow-2xs flex items-center gap-1.5 text-xs font-bold"
          title="Refresh orders"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold">Fetching assigned deliveries...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-black text-slate-800 mb-1">No Active Orders Assigned</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            You're currently all caught up! Check the "Available Orders" tab to claim pending deliveries, or wait for store admin dispatch.
          </p>
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for next delivery</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {orders.map(order => {
            const isExpanded = expandedOrderId === order.id;
            const isCOD = order.paymentMethod.toUpperCase().includes('COD') || order.paymentMethod.toUpperCase().includes('CASH');
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white border-2 border-slate-100 hover:border-brand-200 rounded-3xl p-4 sm:p-5 shadow-sm transition-all"
              >
                {/* Header line: Order number, zone & status badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 tracking-tight">
                        Order #{order.orderNumber}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {order.itemsCount} Items
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                      {order.zone}
                    </span>
                  </div>

                  <div>{getStatusBadge(order.deliveryStatus)}</div>
                </div>

                {/* Customer Info & Direct Dial */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Customer
                    </span>
                    <span className="text-xs font-black text-slate-900 block truncate">
                      {order.customerName}
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium">
                      {order.customerPhone}
                    </span>
                  </div>

                  <a
                    href={`tel:${order.customerPhone}`}
                    className="flex-shrink-0 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>

                {/* Delivery Address & Navigation */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Drop Address
                      </span>
                      <p className="text-xs font-bold text-slate-800 leading-snug">
                        {order.deliveryAddress}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openOpenStreetMap(order.deliveryAddress)}
                    className="flex-shrink-0 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>OSM Map</span>
                  </button>
                </div>

                {/* Payment Breakdown Card */}
                <div className="p-3 rounded-2xl border mb-3 flex items-center justify-between gap-2 bg-slate-50/80 border-slate-200">
                  <div className="flex items-center gap-2">
                    {isCOD ? (
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                        <Banknote className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">
                        Payment Mode
                      </span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {isCOD ? 'Cash on Delivery (COD)' : `Paid Online via ${order.paymentMethod}`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">
                      {isCOD ? 'Amount to Collect' : 'Order Total'}
                    </span>
                    <span className={`text-sm font-black ${isCOD ? 'text-amber-700' : 'text-slate-900'}`}>
                      Rs. {order.total}
                    </span>
                  </div>
                </div>

                {/* Progressive Action Workflow Buttons */}
                <div className="pt-2 border-t border-slate-100">
                  {order.deliveryStatus === 'Assigned' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(order, 'Picked Up')}
                      className="w-full py-3 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-400 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
                    >
                      <Store className="w-4 h-4" />
                      <span>Confirm Picked Up from Store</span>
                    </button>
                  )}

                  {order.deliveryStatus === 'Picked Up' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(order, 'Out for Delivery')}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
                    >
                      <Bike className="w-4 h-4" />
                      <span>Start Route (Out for Delivery)</span>
                    </button>
                  )}

                  {order.deliveryStatus === 'Out for Delivery' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        disabled={isUpdating}
                        onClick={() => setConfirmingOrder(order)}
                        className="py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Delivered</span>
                      </button>

                      <button
                        disabled={isUpdating}
                        onClick={() => setFailingOrder(order)}
                        className="py-3 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Report Issue / Failed</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Marking Delivered */}
      {confirmingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1">
              Complete Delivery #{confirmingOrder.orderNumber}?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Handover verified at {confirmingOrder.deliveryAddress}
            </p>

            {/* If COD, show cash collection confirmation */}
            {(confirmingOrder.paymentMethod.toUpperCase().includes('COD') || confirmingOrder.paymentMethod.toUpperCase().includes('CASH')) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl mb-4 text-left">
                <span className="text-[10px] font-extrabold text-amber-800 uppercase block mb-1">
                  Cash Collection Confirmation
                </span>
                <div className="flex items-center justify-between text-xs font-black text-amber-950 mb-2">
                  <span>Amount to receive:</span>
                  <span className="text-sm text-brand-800 font-black">
                    Rs. {confirmingOrder.total}
                  </span>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cashCollected}
                    onChange={e => setCashCollected(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span>I have collected Rs. {confirmingOrder.total} in cash</span>
                </label>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  (confirmingOrder.paymentMethod.toUpperCase().includes('COD') ||
                    confirmingOrder.paymentMethod.toUpperCase().includes('CASH')) &&
                  !cashCollected
                }
                onClick={() => handleUpdateStatus(confirmingOrder, 'Delivered')}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-black shadow-md transition"
              >
                Confirm Delivered
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failure Reporting Modal */}
      {failingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 text-center mb-1">
              Report Delivery Issue
            </h3>
            <p className="text-xs text-slate-500 text-center mb-4">
              Order #{failingOrder.orderNumber} cannot be completed
            </p>

            <div className="space-y-2 mb-4">
              <label className="block text-xs font-bold text-slate-700">Reason for Failure:</label>
              {[
                'Customer phone unreachable',
                'Incorrect / Unfindable address',
                'Customer refused package / canceled',
                'Store item damaged during transit',
                'Severe weather or road blockage'
              ].map(reason => (
                <label
                  key={reason}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-800"
                >
                  <input
                    type="radio"
                    name="failureReason"
                    value={reason}
                    checked={failureReason === reason}
                    onChange={e => setFailureReason(e.target.value)}
                    className="text-brand-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFailingOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(failingOrder, 'Failed', failureReason)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition"
              >
                Submit Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
