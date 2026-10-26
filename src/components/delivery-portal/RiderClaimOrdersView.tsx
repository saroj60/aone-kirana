import React, { useState, useEffect } from 'react';
import { DeliveryOrder, DeliveryPerson, deliveryService } from '../../services/deliveryService';
import { Package, MapPin, Banknote, CreditCard, ArrowRight, RefreshCw, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface RiderClaimOrdersViewProps {
  rider: DeliveryPerson;
  onOrderClaimed: () => void;
}

export const RiderClaimOrdersView: React.FC<RiderClaimOrdersViewProps> = ({ rider, onOrderClaimed }) => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadClaimableOrders = async () => {
    setLoading(true);
    try {
      const claimable = await deliveryService.getClaimableOrders();
      setOrders(claimable);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaimableOrders();
  }, [rider.id]);

  const handleClaim = async (order: DeliveryOrder) => {
    setClaimingId(order.id);
    setSuccessMessage(null);
    try {
      await deliveryService.claimOrder(order.id, rider.id);
      setSuccessMessage(`Order #${order.orderNumber} claimed! Moved to your Active Deliveries.`);
      await loadClaimableOrders();
      onOrderClaimed();
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Available Orders to Deliver</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              {orders.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Pending grocery dispatches at Aone Kirana Tikathali store counter
          </p>
        </div>

        <button
          onClick={loadClaimableOrders}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-brand-700 hover:border-brand-300 transition shadow-2xs flex items-center gap-1.5 text-xs font-bold"
          title="Refresh available orders"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold">Scanning dispatch queue...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-black text-slate-800 mb-1">All Orders Dispatched</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-3">
            There are no unassigned orders in the store queue right now. Keep your status Online to receive the next assignment!
          </p>
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>Store staging counter clear</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {orders.map(order => {
            const isCOD = order.paymentMethod.toUpperCase().includes('COD') || order.paymentMethod.toUpperCase().includes('CASH');
            const isClaiming = claimingId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 hover:border-brand-300 rounded-3xl p-4 shadow-xs flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-slate-900 tracking-tight">
                      Order #{order.orderNumber}
                    </span>
                    <span className="text-[10px] font-extrabold text-brand-800 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                      Ready to Pick
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span className="font-semibold text-slate-800 line-clamp-2">
                        {order.deliveryAddress}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pl-5">
                      <span>{order.zone}</span>
                      <span>•</span>
                      <span>{order.itemsCount} Items</span>
                    </div>
                  </div>

                  {/* Payment tag */}
                  <div className="p-2.5 bg-slate-50 rounded-2xl flex items-center justify-between mb-3 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      {isCOD ? (
                        <>
                          <Banknote className="w-3.5 h-3.5 text-amber-600" />
                          <span>Cash on Delivery</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                          <span>Prepaid Online</span>
                        </>
                      )}
                    </div>
                    <span className="font-black text-slate-900">Rs. {order.total}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isClaiming || rider.status === 'Off Duty'}
                  onClick={() => handleClaim(order)}
                  className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                >
                  {isClaiming ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : rider.status === 'Off Duty' ? (
                    <span>Go Online to Claim</span>
                  ) : (
                    <>
                      <span>Accept & Claim Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
