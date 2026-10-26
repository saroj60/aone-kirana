import React from 'react';
import { ArrowRight } from 'lucide-react';

interface DoubleMidBannerProps {
  onShopNow: () => void;
  isMobileLayout?: boolean;
}

export const DoubleMidBanner: React.FC<DoubleMidBannerProps> = ({ onShopNow, isMobileLayout = false }) => {
  return (
    <div
      className={
        isMobileLayout
          ? "px-0 py-2"
          : "grid grid-cols-1 md:grid-cols-2 gap-3.5 px-4 sm:px-0 py-2"
      }
    >
      {/* Left Promo Banner: Special Offers on Daily Essentials */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-100/90 via-pink-50 to-orange-50/80 border border-rose-200/80 p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5 z-10 max-w-[65%]">
          {/* Red 20% OFF Sticker */}
          <div className="bg-gradient-to-br from-red-600 to-rose-600 text-white rounded-2xl p-2 sm:p-2.5 text-center shadow-md transform -rotate-3 border border-white/80 flex-shrink-0">
            <span className="block text-[8px] uppercase font-bold tracking-tight">UP TO</span>
            <span className="block text-xs sm:text-base font-black leading-none">20%</span>
            <span className="block text-[8px] font-bold">OFF</span>
          </div>

          <div>
            <h4 className="text-xs sm:text-base font-black text-slate-900 leading-tight">
              Special Offers <br />
              <span className="text-[11px] sm:text-sm font-bold text-slate-700">On Daily Essentials</span>
            </h4>
            <button
              onClick={onShopNow}
              className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 bg-brand-700 hover:bg-brand-800 text-white text-[10px] sm:text-[11px] font-bold rounded-xl shadow-xs active:scale-95 transition"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Product Imagery Collage */}
        <div className="relative w-24 sm:w-28 h-18 sm:h-20 flex-shrink-0">
          <img
            src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&auto=format&fit=crop&q=80"
            alt="Coke"
            className="absolute right-0 bottom-0 w-11 h-14 sm:w-12 sm:h-16 object-cover rounded-xl shadow-sm border border-white"
          />
          <img
            src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&auto=format&fit=crop&q=80"
            alt="Cooking oil"
            className="absolute right-6 bottom-0 w-11 h-16 sm:w-12 sm:h-18 object-cover rounded-xl shadow-sm border border-white"
          />
        </div>
      </div>

      {/* Right Promo Banner: Only shown on Desktop when not isMobileLayout */}
      {!isMobileLayout && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-100/80 via-purple-50 to-fuchsia-50/70 border border-purple-200/80 p-4 shadow-2xs flex items-center justify-between">
          <div className="z-10 max-w-[65%]">
            <h4 className="text-sm sm:text-base font-black text-purple-950 leading-tight">
              Fresh Vegetables <br />
              <span className="text-xs sm:text-sm font-bold text-purple-800">From Local Farmers</span>
            </h4>
            <button
              onClick={onShopNow}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-brand-700 hover:bg-brand-800 text-white text-[11px] font-bold rounded-xl shadow-xs active:scale-95 transition"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="w-28 h-20 relative flex-shrink-0 flex items-center justify-end">
            <img
              src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&auto=format&fit=crop&q=80"
              alt="Fresh local farm vegetables"
              className="w-24 h-20 object-cover rounded-2xl shadow-sm border border-white transform hover:scale-105 transition"
            />
          </div>
        </div>
      )}
    </div>
  );
};
