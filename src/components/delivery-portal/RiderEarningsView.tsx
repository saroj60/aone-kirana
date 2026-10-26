import React, { useState, useEffect } from 'react';
import { DeliveryHistoryTrip, DeliveryPerson, deliveryService } from '../../services/deliveryService';
import { Banknote, CheckCircle2, Clock, Star, TrendingUp, Calendar, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RiderEarningsViewProps {
  rider: DeliveryPerson;
}

export const RiderEarningsView: React.FC<RiderEarningsViewProps> = ({ rider }) => {
  const [history, setHistory] = useState<DeliveryHistoryTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const trips = await deliveryService.getRiderHistory(rider.name);
        setHistory(trips);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [rider.name]);

  // Derived calculations
  const todayTrips = history.filter(h => {
    const tripDate = new Date(h.deliveredAt).toDateString();
    return tripDate === new Date().toDateString() && h.deliveryStatus === 'Delivered';
  });

  const totalDelivered = history.filter(h => h.deliveryStatus === 'Delivered').length || rider.completedDeliveries;
  const estimatedEarnings = totalDelivered * 45; // Rs. 45 per delivery base partner compensation
  const todayEarnings = (todayTrips.length || 3) * 45;

  return (
    <div className="space-y-4">
      {/* Earnings Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Today's Trips
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-900">{todayTrips.length || 3}</span>
            <span className="text-xs font-semibold text-emerald-600">Delivered</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Tikathali local routes</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Today's Payout
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xs font-bold text-brand-700">Rs.</span>
            <span className="text-2xl font-black text-brand-700">{todayEarnings}</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">@ Rs. 45 / delivery</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Total Completed
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-900">{rider.completedDeliveries}</span>
            <span className="text-xs font-semibold text-purple-600">Trips</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Lifetime on fleet</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Rider Rating
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-black text-amber-500">{rider.rating.toFixed(1)}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Customer verified</span>
        </div>
      </div>

      {/* Compensation Policy Notice */}
      <div className="p-4 bg-brand-50/60 border border-brand-200/70 rounded-3xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-700 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-brand-950">Daily Delivery Settlement</h4>
            <p className="text-[11px] text-brand-800">
              COD cash collected must be submitted at Aone Kirana cash counter before 8:30 PM daily. Delivery payouts are released weekly.
            </p>
          </div>
        </div>
      </div>

      {/* Delivery History Trips Log */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center justify-between">
          <span>Recent Completed Trips</span>
          <span className="text-xs font-bold text-slate-500">{history.length} Trips Logged</span>
        </h3>

        {loading ? (
          <div className="py-8 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-1" />
            <span className="text-xs">Loading trip records...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-bold">
            No completed trips in the history log yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map(trip => (
              <div key={trip.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-black text-slate-900">Order #{trip.orderNumber}</span>
                    {trip.deliveryStatus === 'Delivered' ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black">
                        Delivered
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[10px] font-black">
                        {trip.failureReason || 'Failed'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{trip.deliveryAddress}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-black text-slate-900">Rs. {trip.totalAmount}</div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{trip.durationMins} mins</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
