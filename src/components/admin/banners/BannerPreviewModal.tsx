import React, { useState } from 'react';
import { X, Monitor, Smartphone, ExternalLink, ArrowRight, Zap, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { Banner } from '../../../services/bannerService';

interface BannerPreviewModalProps {
  isOpen: boolean;
  banner: Banner | null;
  onClose: () => void;
}

export const BannerPreviewModal: React.FC<BannerPreviewModalProps> = ({
  isOpen,
  banner,
  onClose
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen || !banner) return null;

  const bgColor = banner.bgColor || 'from-purple-50 via-purple-100/70 to-fuchsia-50/50';
  const borderColor = banner.borderColor || 'border-purple-200/80';
  const badgeText = banner.badgeText || 'Fresh | Affordable | Fast Delivery';
  const deliveryTime = banner.deliveryTime || 'Delivery in 30–60 mins';
  const deliveryRadius = banner.deliveryRadius || '3 km Radius (Tikathali & Nearby)';
  const qualityText = banner.qualityText || 'Quality Products Everyday';
  const stampText = banner.stampText || 'Fresh Healthy Affordable';
  const discountText = banner.discountText || 'UP TO 20% OFF';
  const ctaText = banner.ctaText || 'Shop Now';
  const displayImage = viewport === 'mobile' && banner.mobileImage ? banner.mobileImage : banner.image;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Viewport Toggles */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-900 text-sm">Storefront Banner Preview</h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                banner.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Order #{banner.displayOrder} • {banner.status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Viewport switcher */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl">
              <button
                onClick={() => setViewport('desktop')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  viewport === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (1200px)</span>
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  viewport === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (375px)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="p-6 overflow-y-auto bg-slate-100/60 flex items-center justify-center min-h-[420px]">
          {viewport === 'desktop' ? (
            /* DESKTOP PREVIEW CONTAINER */
            <div className="w-full max-w-3xl">
              <div
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bgColor} border ${borderColor} p-6 lg:p-7 shadow-md`}
              >
                {/* Stamp */}
                {stampText && (
                  <div className="absolute top-5 right-1/3 z-20 transform -rotate-3">
                    <div className="bg-brand-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-md border-2 border-white tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>{stampText}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-6 relative z-10">
                  <div className="max-w-[62%]">
                    {badgeText && (
                      <div className="inline-flex items-center gap-1.5 bg-purple-100/90 text-purple-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
                        <span>{badgeText}</span>
                      </div>
                    )}

                    <h2 className="text-2xl font-black text-purple-950 tracking-tight leading-tight mb-2">
                      <span>{banner.title}</span>
                    </h2>

                    {banner.subtitle && (
                      <p className="text-sm font-semibold text-slate-600 mb-4 line-clamp-2">
                        {banner.subtitle}
                      </p>
                    )}

                    {/* Pills */}
                    <div className="flex flex-wrap items-center gap-2 mb-5 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200/60">
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span>{deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200/60">
                        <MapPin className="w-3 h-3 text-brand-700" />
                        <span>{deliveryRadius}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200/60">
                        <ShieldCheck className="w-3 h-3 text-purple-600" />
                        <span>{qualityText}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-md">
                        <span>{ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {discountText && (
                        <span className="text-xs font-extrabold text-brand-800 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-xl">
                          {discountText}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-48 h-44 flex items-center justify-center">
                    <img
                      src={displayImage}
                      alt={banner.title}
                      className="w-full h-full object-contain filter drop-shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* MOBILE PHONE PREVIEW FRAME (375px) */
            <div className="w-[360px] bg-white rounded-[40px] shadow-2xl border-4 border-slate-800 p-3 relative overflow-hidden">
              {/* Phone Speaker Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

              {/* Mobile Hero Banner */}
              <div
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bgColor} border ${borderColor} p-4 shadow-xs`}
              >
                {/* 20% OFF Sticker */}
                {discountText && (
                  <div className="absolute top-2 right-2 z-20 w-12 h-12 rounded-full bg-rose-600 text-white flex flex-col items-center justify-center text-center shadow-md transform rotate-6 border border-white">
                    <span className="text-[7px] uppercase font-bold leading-none">
                      {discountText.replace('OFF', '').trim()}
                    </span>
                    <span className="text-[7px] font-extrabold leading-none mt-0.5">OFF</span>
                  </div>
                )}

                <div className="flex items-end justify-between gap-1 relative z-10">
                  <div className="w-[64%]">
                    <div className="inline-block bg-purple-100/90 text-purple-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1 truncate max-w-full">
                      {badgeText}
                    </div>

                    <h3 className="text-sm font-black text-purple-950 leading-tight mb-2">
                      <span>{banner.title}</span>
                    </h3>

                    <div className="space-y-0.5 mb-2.5 text-[10px] font-medium text-slate-700">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span className="truncate">{deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-700" />
                        <span className="truncate">{deliveryRadius}</span>
                      </div>
                    </div>

                    <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-700 text-white text-[11px] font-bold rounded-xl shadow-xs">
                      <span>{ctaText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="w-[36%] h-28 flex items-end justify-center">
                    <img
                      src={displayImage}
                      alt={banner.title}
                      className="w-full h-24 object-contain filter drop-shadow-sm rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Details */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span>Target Destination: </span>
            <strong className="text-slate-800 font-mono">{banner.ctaDestination}</strong>
          </div>
          <div>
            <span>Schedule: </span>
            <strong className="text-slate-800">
              {new Date(banner.startDate).toLocaleDateString()} – {new Date(banner.endDate).toLocaleDateString()}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
