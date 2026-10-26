import React from 'react';
import { ShoppingBag, Search, MapPin, Bell, User, ChevronDown, Bike } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';

interface DesktopHeaderProps {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onOpenAccount: () => void;
  onOpenAdmin?: () => void;
  onOpenDeliveryPortal?: () => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  onOpenAccount,
  onOpenAdmin,
  onOpenDeliveryPortal
}) => {
  const { selectedLocation, setIsLocationModalOpen, hasUserConfirmedLocation } = useLocation();
  const { setIsNotificationsOpen } = useOrders();
  const { profile, setIsAuthModalOpen } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 py-3 transition-all">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src="/logo.png"
            alt="Aone Kirana Logo"
            className="w-11 h-11 object-contain rounded-xl flex-shrink-0 drop-shadow-sm hover:scale-105 transition-transform"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight flex items-center gap-1">
              <span>Aone</span>
              <span className="text-brand-700">Kirana</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-500 tracking-tight -mt-0.5">
              Fresh Grocery, Fast Delivery
            </p>
          </div>
        </div>

        {/* Center Wide Search Bar */}
        <div className="flex-1 max-w-2xl mx-2">
          <div className="flex items-center bg-slate-50 border border-slate-200/90 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-200 focus-within:border-brand-600 transition">
            <div className="pl-3.5 pr-1 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search for products (e.g. rice, milk, bread...)"
              className="w-full py-2.5 px-2 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <button
              className="bg-brand-700 hover:bg-brand-800 text-white px-5 py-2.5 flex items-center justify-center transition"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Info Controls */}
        <div className="flex items-center gap-3">
          {/* Deliver To */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition text-left ${
              !hasUserConfirmedLocation || !selectedLocation.address
                ? 'bg-brand-50 border-brand-400 text-brand-700 animate-pulse hover:bg-brand-100'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title={`Deliver to: ${selectedLocation.address || selectedLocation.name}${selectedLocation.landmark ? ` (Near: ${selectedLocation.landmark})` : ''}`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              !hasUserConfirmedLocation || !selectedLocation.address
                ? 'bg-brand-700 text-white'
                : 'bg-brand-50 text-brand-700'
            }`}>
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-none">
                {!hasUserConfirmedLocation || !selectedLocation.address ? 'Location Needed' : 'Deliver to'}
              </span>
              <span className="block text-xs font-bold text-slate-800 truncate max-w-[150px] leading-tight">
                {!hasUserConfirmedLocation || !selectedLocation.address ? 'Detect or save location' : (selectedLocation.name || selectedLocation.address || 'Set Location')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-accent-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
              2
            </span>
          </button>

          {/* Rider Fleet Portal Shortcut */}
          {onOpenDeliveryPortal && (
            <button
              onClick={onOpenDeliveryPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-brand-800 border border-purple-200/80 transition text-xs font-bold active:scale-95 shadow-2xs"
              title="Open Delivery Partner / Rider Portal"
            >
              <Bike className="w-4 h-4 text-brand-700" />
              <span>Rider Portal</span>
            </button>
          )}



          {/* User Account / Register Pill */}
          <button
            onClick={() => {
              if (profile) {
                onOpenAccount();
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            className="flex items-center gap-2 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 transition"
          >
            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-brand-700 font-bold text-xs">
              {profile?.fullName ? (
                profile.fullName.trim().slice(0, 1).toUpperCase()
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <span className="text-xs font-bold text-slate-800">
              {profile?.fullName ? `Hello, ${profile.fullName.split(' ')[0]}` : 'Sign In / Register'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
