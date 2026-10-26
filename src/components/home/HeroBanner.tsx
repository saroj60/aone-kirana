import React, { useState, useEffect } from 'react';
import { Zap, MapPin, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { bannerService, Banner } from '../../services/bannerService';

interface HeroBannerProps {
  onShopNow?: () => void;
  isMobileLayout?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopNow, isMobileLayout = false }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadBanners = async () => {
    try {
      const activeList = await bannerService.getActiveBanners();
      setBanners(activeList);
      setActiveSlide(0);
    } catch (err) {
      console.warn('Failed to load active banners', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();

    // Listen to reactive update event when admin changes banners
    const handleUpdate = () => {
      loadBanners();
    };
    window.addEventListener('aone_banners_updated', handleUpdate);
    return () => window.removeEventListener('aone_banners_updated', handleUpdate);
  }, []);

  // Automatic carousel rotation every 7 seconds if multiple slides exist
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % banners.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading || banners.length === 0) {
    return (
      <div className="py-2">
        <div className="rounded-3xl bg-slate-100 animate-pulse h-48 sm:h-64 border border-slate-200" />
      </div>
    );
  }

  const current = banners[activeSlide] || banners[0];

  const handleCtaClick = () => {
    if (current.id) {
      bannerService.recordClick(current.id);
    }
    if (onShopNow) {
      onShopNow();
    } else if (current.ctaDestination) {
      if (current.ctaDestination.startsWith('#') || current.ctaDestination.startsWith('/')) {
        window.location.href = current.ctaDestination;
      }
    }
  };

  // Helper gradient fallback
  const bgColor = current.bgColor || 'from-purple-50 via-purple-100/70 to-fuchsia-50/50';
  const borderColor = current.borderColor || 'border-purple-200/80';
  const badgeText = current.badgeText || 'Fresh | Affordable | Fast Delivery';
  const deliveryTime = current.deliveryTime || 'Delivery in 30–60 mins';
  const deliveryRadius = current.deliveryRadius || '3 km Radius (Tikathali & Nearby)';
  const qualityText = current.qualityText || 'Quality Products Everyday';
  const stampText = current.stampText || 'Fresh Healthy Affordable';
  const discountText = current.discountText || 'UP TO 20% OFF';
  const ctaText = current.ctaText || 'Shop Now';

  // Responsive image selection
  const heroImage = isMobileLayout && current.mobileImage ? current.mobileImage : current.image;

  // Determine if this banner is a complete graphic banner (e.g. uploaded hero banner or graphic asset)
  const isGraphicOnly =
    current.id === 'banner-001' ||
    current.image === '/hero_banner.jpg' ||
    current.image.includes('hero_banner') ||
    current.image.includes('nano_banana') ||
    current.image.includes('media_1790760969990');

  /* -------------------------------------------------------------
     RENDER MOBILE HERO SECTION (Responsive & Dynamic from Backend)
  ------------------------------------------------------------- */
  if (isMobileLayout) {
    if (isGraphicOnly) {
      return (
        <div className="px-4 py-2">
          <div
            onClick={handleCtaClick}
            className="relative overflow-hidden rounded-2xl shadow-xs cursor-pointer active:scale-[0.98] transition-transform border border-purple-200/60 bg-gradient-to-br from-purple-100/40 to-fuchsia-50/40"
          >
            <img
              src={heroImage}
              alt={current.title || 'Aone Kirana Banner'}
              className="w-full h-auto object-cover rounded-2xl block"
              loading="eager"
            />
          </div>

          {/* Carousel indicators */}
          {banners.length > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`transition-all rounded-full ${
                    idx === activeSlide ? 'w-5 h-1.5 bg-brand-700' : 'w-1.5 h-1.5 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="px-4 py-2">
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bgColor} border ${borderColor} p-4 shadow-xs`}>
          {/* Round Discount Sticker on Top Right */}
          {discountText && (
            <div className="absolute top-3 right-3 z-20 w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 text-white flex flex-col items-center justify-center text-center shadow-md transform rotate-6 border border-white/90">
              <span className="text-[8px] uppercase font-bold tracking-tight opacity-90 leading-none">
                {discountText.includes('OFF') ? discountText.replace('OFF', '').trim() : discountText}
              </span>
              <span className="text-[8px] font-extrabold leading-none mt-0.5">OFF</span>
            </div>
          )}

          <div className="flex items-end justify-between gap-1 relative z-10">
            {/* Left Content Area (Guaranteed width to prevent text squishing) */}
            <div className="w-[64%] flex-shrink-0">
              {/* Purple Badge Tag */}
              {badgeText && (
                <div className="inline-flex items-center gap-1 bg-purple-100/90 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 truncate max-w-full">
                  <span>{badgeText}</span>
                </div>
              )}

              {/* Dynamic Title */}
              <h2 className="text-lg font-black text-purple-950 tracking-tight leading-snug mb-2.5">
                <span>{current.title}</span>
                {current.subtitle && (
                  <span className="block text-brand-700 text-xs font-semibold mt-0.5 line-clamp-1">
                    {current.subtitle}
                  </span>
                )}
              </h2>

              {/* 3 Bullets with Icons */}
              <div className="space-y-1 mb-3 text-[11px] font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400 flex-shrink-0" />
                  <span className="truncate">{deliveryTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-700 flex-shrink-0" />
                  <span className="text-slate-600 truncate">{deliveryRadius}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span className="text-slate-600 truncate">{qualityText}</span>
                </div>
              </div>

              {/* Dynamic Shop Now Button */}
              <button
                onClick={handleCtaClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right Graphic Area with Mobile Image */}
            <div className="w-[36%] h-36 flex items-end justify-center relative flex-shrink-0">
              <img
                src={heroImage}
                alt={current.title}
                className="w-full h-32 object-contain filter drop-shadow-md rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Carousel indicators */}
        {banners.length > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`transition-all rounded-full ${
                  idx === activeSlide ? 'w-5 h-1.5 bg-brand-700' : 'w-1.5 h-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* -------------------------------------------------------------
     RENDER DESKTOP HERO SECTION (Dynamic from Backend Banner API)
  ------------------------------------------------------------- */
  if (isGraphicOnly) {
    return (
      <div className="py-2">
        <div
          onClick={handleCtaClick}
          className="relative overflow-hidden rounded-3xl shadow-sm cursor-pointer group active:scale-[0.99] transition-transform border border-purple-200/60 bg-gradient-to-br from-purple-100/40 to-fuchsia-50/40"
        >
          <img
            src={heroImage}
            alt={current.title || 'Aone Kirana Banner'}
            className="w-full h-auto max-h-[420px] object-cover rounded-3xl block transition-transform duration-300 group-hover:scale-[1.005]"
            loading="eager"
          />
        </div>

        {/* Carousel dots */}
        {banners.length > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-2.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`transition-all rounded-full ${
                  idx === activeSlide ? 'w-6 h-1.5 bg-brand-700' : 'w-1.5 h-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bgColor} border ${borderColor} p-6 lg:p-7 shadow-xs transition-all duration-500`}>
        {/* Brush Stamp */}
        {stampText && (
          <div className="absolute top-5 right-1/3 z-20 hidden md:block transform -rotate-3">
            <div className="bg-brand-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-md border-2 border-white tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{stampText}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-6 relative z-10">
          {/* Left Text & Features */}
          <div className="max-w-[62%]">
            {badgeText && (
              <div className="inline-flex items-center gap-1.5 bg-purple-100/90 text-purple-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
                <span>{badgeText}</span>
              </div>
            )}

            <h2 className="text-2xl lg:text-3xl font-black text-purple-950 tracking-tight leading-tight mb-2">
              <span>{current.title}</span>
            </h2>

            {current.subtitle && (
              <p className="text-sm font-semibold text-slate-600 mb-4 line-clamp-2">
                {current.subtitle}
              </p>
            )}

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/60 shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400 flex-shrink-0" />
                <span className="text-slate-800">{deliveryTime}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/60 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-brand-700 flex-shrink-0" />
                <span className="text-slate-800">{deliveryRadius}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/60 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                <span className="text-slate-800">{qualityText}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCtaClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs lg:text-sm font-bold rounded-2xl shadow-md active:scale-95 transition-all"
              >
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

          {/* Right Hero Image */}
          <div className="w-48 lg:w-64 h-44 lg:h-52 relative flex items-center justify-center flex-shrink-0">
            <img
              src={heroImage}
              alt={current.title}
              className="w-full h-full object-contain filter drop-shadow-xl transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      {/* Carousel dots */}
      {banners.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-2.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`transition-all rounded-full ${
                idx === activeSlide ? 'w-6 h-1.5 bg-brand-700' : 'w-1.5 h-1.5 bg-slate-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
