import React, { useState, useEffect } from 'react';
import {
  deliveryService,
  DeliveryPerson,
  DeliveryOrder
} from '../../services/deliveryService';
import { RiderLoginView } from './RiderLoginView';
import { RiderOrdersView } from './RiderOrdersView';
import { RiderClaimOrdersView } from './RiderClaimOrdersView';
import { RiderEarningsView } from './RiderEarningsView';
import {
  Bike,
  Package,
  CheckCircle2,
  DollarSign,
  User,
  Power,
  LogOut,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

interface DeliveryPartnerPortalProps {
  onClose: () => void;
  onOpenAdmin?: () => void;
}

type TabType = 'active' | 'claim' | 'earnings' | 'profile';

export const DeliveryPartnerPortal: React.FC<DeliveryPartnerPortalProps> = ({ onClose, onOpenAdmin }) => {
  const [activeRider, setActiveRider] = useState<DeliveryPerson | null>(() => deliveryService.getActiveRider());
  const [currentTab, setCurrentTab] = useState<TabType>('active');
  const [activeCount, setActiveCount] = useState(0);
  const [claimableCount, setClaimableCount] = useState(0);

  const refreshCounts = async () => {
    if (!activeRider) return;
    try {
      const riderOrders = await deliveryService.getRiderOrders(activeRider.id);
      const active = riderOrders.filter(o => o.deliveryStatus !== 'Delivered' && o.deliveryStatus !== 'Failed');
      setActiveCount(active.length);

      const claimable = await deliveryService.getClaimableOrders();
      setClaimableCount(claimable.length);

      // Refresh rider profile from storage in case status changed
      const fresh = deliveryService.getActiveRider();
      if (fresh) setActiveRider(fresh);
    } catch (e) {
      console.warn('Failed refreshing rider counts:', e);
    }
  };

  useEffect(() => {
    if (activeRider) {
      refreshCounts();
    }
  }, [activeRider?.id]);

  const handleDutyToggle = async () => {
    if (!activeRider) return;
    const nextStatus = activeRider.status === 'Off Duty' ? 'Available' : 'Off Duty';
    const updated = await deliveryService.updateRiderDuty(activeRider.id, nextStatus);
    setActiveRider({ ...updated });
  };

  const handleLogout = () => {
    deliveryService.riderLogout();
    setActiveRider(null);
  };

  // If not logged in, show Rider Login screen
  if (!activeRider) {
    return (
      <RiderLoginView
        onLoginSuccess={rider => {
          setActiveRider(rider);
          refreshCounts();
        }}
        onBackToStore={onClose}
      />
    );
  }

  const isOnline = activeRider.status !== 'Off Duty';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header App Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Left: Brand & Return */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              title="Return to Customer Storefront"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Aone Kirana"
                className="w-8 h-8 object-contain rounded-xl flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs sm:text-sm font-black text-white leading-tight">
                    Aone Kirana Rider
                  </h1>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-brand-900/80 text-purple-300 border border-purple-400/30">
                    PARTNER
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Tikathali Dispatch Hub</p>
              </div>
            </div>
          </div>

          {/* Right: Duty Switch & Rider Pill */}
          <div className="flex items-center gap-2">
            {/* Duty Switch Button */}
            <button
              onClick={handleDutyToggle}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span>{isOnline ? 'On Duty (Online)' : 'Off Duty'}</span>
            </button>

            {/* Quick Switch to Admin if available */}
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition"
                title="Switch to Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin</span>
              </button>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
              title="Sign Out of Rider Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-1 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCurrentTab('active')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              currentTab === 'active'
                ? 'border-brand-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Tasks</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('claim')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              currentTab === 'claim'
                ? 'border-brand-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Available Deliveries</span>
            {claimableCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">
                {claimableCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('earnings')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              currentTab === 'earnings'
                ? 'border-brand-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Earnings & Trips</span>
          </button>

          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              currentTab === 'profile'
                ? 'border-brand-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Rider Profile</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-20">
        {currentTab === 'active' && (
          <RiderOrdersView rider={activeRider} onOrderUpdated={refreshCounts} />
        )}

        {currentTab === 'claim' && (
          <RiderClaimOrdersView rider={activeRider} onOrderClaimed={refreshCounts} />
        )}

        {currentTab === 'earnings' && <RiderEarningsView rider={activeRider} />}

        {currentTab === 'profile' && (
          <div className="max-w-md mx-auto space-y-4">
            {/* Rider Identity Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-xs">
              <img
                src={activeRider.avatar}
                alt={activeRider.name}
                className="w-20 h-20 rounded-2xl object-cover mx-auto mb-3 border-2 border-brand-200 shadow-sm"
              />
              <h2 className="text-lg font-black text-slate-900">{activeRider.name}</h2>
              <p className="text-xs font-semibold text-slate-500">{activeRider.phone}</p>

              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-bold border border-brand-200">
                  {activeRider.vehicle}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold flex items-center gap-1 border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{activeRider.rating.toFixed(1)} Rating</span>
                </span>
              </div>
            </div>

            {/* Quick Details List */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Hub Location</span>
                <span className="font-bold text-slate-800">Tikathali Chowk, Ward 5</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Total Lifetime Trips</span>
                <span className="font-black text-brand-700">
                  {activeRider.completedDeliveries} Deliveries
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Duty Status</span>
                <span
                  className={`font-black ${
                    activeRider.status !== 'Off Duty' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {activeRider.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-semibold text-slate-500">Store Support Helpline</span>
                <a href="tel:9841234567" className="font-bold text-brand-700">
                  +977-9841234567
                </a>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-slate-200 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Partner App</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
