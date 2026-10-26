import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SpecialOffersBannerProps {
  onShopEssentials?: () => void;
}

export const SpecialOffersBanner: React.FC<SpecialOffersBannerProps> = ({ onShopEssentials }) => {
  return (
    <div className="px-4 py-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-100/90 via-pink-50 to-orange-50 border border-rose-200/70 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          {/* Left Red Offer Badge */}
          <div className="flex-shrink-0 bg-gradient-to-br from-red-600 to-rose-600 text-white rounded-2xl p-2.5 sm:p-3 text-center shadow-md transform -rotate-2 border-2 border-white/80">
            <span className="block text-[9px] uppercase font-bold tracking-tight">Special</span>
            <span className="block text-xs font-black uppercase tracking-wider">Offers</span>
            <span className="block text-[10px] font-bold text-yellow-300 mt-0.5">UP TO</span>
            <span className="block text-sm sm:text-base font-black leading-none text-white">20%</span>
            <span className="block text-[9px] font-bold">OFF</span>
          </div>

          {/* Middle text & Shop Now button */}
          <div className="flex-1 pl-2">
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3 h-3" />
              <span>Limited Stock Sale</span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              Daily Essentials <br />
              <span className="text-slate-700 font-bold text-sm">at Best Price</span>
            </h4>
            <button
              onClick={onShopEssentials}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow active:scale-95 transition"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Right Product Collage */}
          <div className="w-24 sm:w-32 h-20 sm:h-24 relative flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80"
              alt="Beverage"
              className="absolute right-0 bottom-0 w-14 h-16 object-cover rounded-xl shadow-md border-2 border-white"
            />
            <img
              src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=80"
              alt="Cooking Oil"
              className="absolute right-8 bottom-1 w-14 h-18 object-cover rounded-xl shadow-md border-2 border-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
