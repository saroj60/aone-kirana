import React from 'react';
import { User, MapPin, Heart, Phone, Globe, ChevronRight, LogIn, LogOut, Bike } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useLocation } from '../../context/LocationContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';

interface AccountViewProps {
  onOpenAdmin: () => void;
  onOpenDeliveryPortal?: () => void;
  onOpenWishlist?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ onOpenAdmin, onOpenDeliveryPortal }) => {
  const { wishlist } = useWishlist();
  const { selectedLocation, setIsLocationModalOpen } = useLocation();
  const { orders } = useOrders();
  const { user, profile, signOut, setIsAuthModalOpen } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'AK';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="px-4 py-3 pb-24 animate-fadeIn">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-brand-700 to-purple-800 rounded-3xl p-5 text-white shadow-md mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border-2 border-white/40 font-black text-xl flex-shrink-0">
            {getInitials(profile?.fullName)}
          </div>
          <div>
            <h2 className="text-lg font-bold">{profile?.fullName || 'Customer Profile'}</h2>
            <p className="text-xs text-purple-100 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" />
              {profile?.phone || 'Not provided'}
            </p>
            <p className="text-[11px] text-purple-200 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {profile?.address || selectedLocation.name}
            </p>
          </div>
        </div>

        {profile ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition text-xs font-semibold"
            >
              Switch
            </button>
            <button
              onClick={() => signOut()}
              title="Log Out"
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition text-xs font-semibold flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3.5 py-2 bg-white text-brand-800 rounded-xl font-bold text-xs shadow hover:bg-purple-50 transition flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Register / Login</span>
          </button>
        )}
      </div>



      {/* Account Settings & Quick Links */}
      <div className="space-y-2.5">

        {/* Delivery Partner / Rider Portal Card */}
        {onOpenDeliveryPortal && (
          <div
            onClick={onOpenDeliveryPortal}
            className="p-3.5 bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200 rounded-2xl cursor-pointer hover:border-purple-300 transition flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-700 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900">Delivery Partner Portal</h4>
                  <span className="text-[9px] bg-brand-700 text-white font-extrabold px-1.5 py-0.2 rounded">Rider App</span>
                </div>
                <p className="text-[11px] text-slate-500">Claim customer orders, navigate with GPS & track earnings</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-brand-700" />
          </div>
        )}

        {/* Saved Addresses */}
        <div
          onClick={() => setIsLocationModalOpen(true)}
          className="p-3.5 bg-white border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-50 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-brand-700" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Delivery Address</h4>
              <p className="text-[11px] text-slate-500">{selectedLocation.name} (Change)</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Favorite Wishlist */}
        <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Favorite Products</h4>
              <p className="text-[11px] text-slate-500">{wishlist.length} saved grocery items</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">{wishlist.length}</span>
        </div>

        {/* Store Contact & Helpline */}
        <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-brand-700 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Aone Kirana Store Helpline</h4>
              <p className="text-[11px] text-slate-500">+977-9841234567 • Tikathali Chowk</p>
            </div>
          </div>
          <a
            href="tel:9841234567"
            className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold hover:bg-brand-100"
          >
            Call
          </a>
        </div>

        {/* Language selector */}
        <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">App Language</h4>
              <p className="text-[11px] text-slate-500">English / नेपाली</p>
            </div>
          </div>
          <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
            English
          </span>
        </div>
      </div>

      <div className="mt-8 text-center text-[11px] text-slate-400">
        <p className="font-semibold text-slate-600">Aone Kirana Grocery v1.0.0</p>
        <p>Serving Tikathali, Mahalaxmi Municipality, Lalitpur</p>
        <div className="pt-3 flex justify-center items-center gap-3 text-[10px] text-slate-400">
          <button onClick={onOpenAdmin} className="hover:text-slate-600 underline">Staff Admin</button>
          {onOpenDeliveryPortal && (
            <>
              <span>•</span>
              <button onClick={onOpenDeliveryPortal} className="hover:text-slate-600 underline">Rider Portal</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
