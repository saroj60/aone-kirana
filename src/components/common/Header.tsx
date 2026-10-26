import React from 'react';
import { MapPin, Bell, ChevronDown, User } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onSearchFocus?: () => void;
  onOpenAccount?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAccount }) => {
  const { selectedLocation, setIsLocationModalOpen, hasUserConfirmedLocation } = useLocation();
  const { setIsNotificationsOpen } = useOrders();
  const { profile, setIsAuthModalOpen } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3.5 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-2.5">
        {/* Left Side: App Logo & Location Card */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img
            src="/logo.png"
            alt="Aone Kirana Logo"
            className="w-9 h-9 object-contain rounded-xl flex-shrink-0 drop-shadow-xs"
          />

          {/* Location Card */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className={`flex items-center gap-2 transition-all px-2.5 py-1.5 rounded-2xl border text-left min-w-0 max-w-[210px] sm:max-w-[260px] active:scale-98 ${
              !hasUserConfirmedLocation || !selectedLocation.address
                ? 'bg-purple-50 hover:bg-purple-100 border-purple-300 ring-2 ring-purple-200/60 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80'
            }`}
            title={`Deliver to: ${selectedLocation.address || selectedLocation.name}${selectedLocation.landmark ? ` (Near: ${selectedLocation.landmark})` : ''}`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
              !hasUserConfirmedLocation || !selectedLocation.address
                ? 'bg-purple-600 text-white animate-pulse'
                : 'bg-brand-50 text-brand-700'
            }`}>
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <span className="block text-[9px] uppercase font-extrabold text-slate-400 tracking-wider leading-none">
                Deliver to
              </span>
              <span className="block text-xs font-bold text-slate-800 truncate leading-tight mt-0.5">
                {hasUserConfirmedLocation && selectedLocation.address
                  ? (selectedLocation.name || selectedLocation.address)
                  : 'Detect or save location'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-auto" />
          </button>
        </div>

        {/* Right Side: Notification Bell + User Profile Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200/80 active:scale-90 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-accent-red text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
              2
            </span>
          </button>

          {/* User Logo / Profile Avatar */}
          <button
            onClick={() => {
              if (profile && onOpenAccount) {
                onOpenAccount();
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            className="w-8 h-8 rounded-xl bg-purple-100 hover:bg-purple-200 border border-purple-200/80 flex items-center justify-center text-brand-700 font-bold text-xs active:scale-90 transition-all shadow-2xs"
            aria-label="User Account"
            title={profile?.fullName || 'User Profile'}
          >
            {profile?.fullName ? (
              profile.fullName.trim().slice(0, 2).toUpperCase()
            ) : (
              <User className="w-4 h-4 text-brand-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

