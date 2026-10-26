import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Upload, Sparkles, Eye, ArrowRight, Smartphone, Monitor } from 'lucide-react';
import { Banner, bannerService, BANNER_PRESETS } from '../../../services/bannerService';

interface BannerFormModalProps {
  isOpen: boolean;
  bannerToEdit: Banner | null;
  onClose: () => void;
  onSuccess: (saved: Banner) => void;
}

export const BannerFormModal: React.FC<BannerFormModalProps> = ({
  isOpen,
  bannerToEdit,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [mobileImage, setMobileImage] = useState('');
  const [discountText, setDiscountText] = useState('UP TO 20% OFF');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [ctaDestination, setCtaDestination] = useState('/category/all');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
  );
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live preview mode toggle
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (bannerToEdit) {
      setTitle(bannerToEdit.title);
      setSubtitle(bannerToEdit.subtitle);
      setImage(bannerToEdit.image);
      setMobileImage(bannerToEdit.mobileImage || bannerToEdit.image);
      setDiscountText(bannerToEdit.discountText || 'UP TO 20% OFF');
      setCtaText(bannerToEdit.ctaText || 'Shop Now');
      setCtaDestination(bannerToEdit.ctaDestination || '/category/all');
      setStartDate(bannerToEdit.startDate.split('T')[0]);
      setEndDate(bannerToEdit.endDate.split('T')[0]);
      setDisplayOrder(bannerToEdit.displayOrder || 1);
      setStatus(bannerToEdit.status === 'inactive' ? 'inactive' : 'active');
    } else {
      // Default new banner
      setTitle('Daily Groceries Delivered to Your Door');
      setSubtitle('Fresh, affordable and fast delivery across Lalitpur');
      setImage('https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80');
      setMobileImage('https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80');
      setDiscountText('UP TO 20% OFF');
      setCtaText('Shop Now');
      setCtaDestination('/category/all');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]);
      setDisplayOrder(1);
      setStatus('active');
    }
    setErrorMsg(null);
  }, [bannerToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      if (isMobile) {
        setMobileImage(dataUrl);
      } else {
        setImage(dataUrl);
        if (!mobileImage) setMobileImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyPreset = (preset: typeof BANNER_PRESETS[0]) => {
    setTitle(preset.title);
    setSubtitle(preset.subtitle);
    setDiscountText(preset.discountText);
    setImage(preset.image);
    setMobileImage(preset.image);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Banner title is required.');
      return;
    }
    if (!image.trim()) {
      setErrorMsg('Desktop image URL or file is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Banner> = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        image: image.trim(),
        mobileImage: (mobileImage.trim() || image.trim()),
        discountText: discountText.trim(),
        ctaText: ctaText.trim(),
        ctaDestination: ctaDestination.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate + 'T23:59:59.999Z').toISOString(),
        displayOrder: Number(displayOrder) || 1,
        status
      };

      let result: Banner;
      if (bannerToEdit) {
        result = await bannerService.updateBanner(bannerToEdit.id || bannerToEdit._id!, payload);
      } else {
        result = await bannerService.createBanner(payload);
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {bannerToEdit ? `Edit Banner #${bannerToEdit.displayOrder}` : 'Create Homepage Banner'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Setup desktop and mobile hero promotion with discount badge and CTA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Quick Presets Bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Theme Presets</span>
              </label>
              <span className="text-[10px] text-slate-400">Click to auto-populate</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BANNER_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-800 hover:border-brand-200 border border-slate-200 rounded-xl text-[10px] font-bold transition text-slate-700"
                >
                  {p.title.split(' ')[0]} {p.title.split(' ')[1]} ({p.discountText})
                </button>
              ))}
            </div>
          </div>

          {/* Title & Subtitle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Banner Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Daily Groceries Delivered to Your Door"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subtitle / Description *
            </label>
            <input
              type="text"
              required
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="e.g. Fresh, affordable and fast delivery"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Discount Text & CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Discount Badge Text
              </label>
              <input
                type="text"
                value={discountText}
                onChange={e => setDiscountText(e.target.value)}
                placeholder="e.g. UP TO 20% OFF"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-600 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                CTA Button Text
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={e => setCtaText(e.target.value)}
                placeholder="e.g. Shop Now"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                CTA Target Destination
              </label>
              <input
                type="text"
                value={ctaDestination}
                onChange={e => setCtaDestination(e.target.value)}
                placeholder="e.g. /category/all, #products"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Images: Desktop & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Desktop Image */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-brand-700" />
                  <span>Desktop Banner Image *</span>
                </label>
                <label className="text-[10px] text-brand-700 font-bold hover:underline cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileUpload(e, false)}
                    className="hidden"
                  />
                </label>
              </div>

              <input
                type="text"
                required
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="Image URL: https://..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
              />

              {image && (
                <div className="h-20 bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                  <img src={image} alt="Desktop Preview" className="h-full object-contain" />
                </div>
              )}
            </div>

            {/* Mobile Image */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-brand-700" />
                  <span>Mobile Banner Image</span>
                </label>
                <label className="text-[10px] text-brand-700 font-bold hover:underline cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileUpload(e, true)}
                    className="hidden"
                  />
                </label>
              </div>

              <input
                type="text"
                value={mobileImage}
                onChange={e => setMobileImage(e.target.value)}
                placeholder="Mobile image URL (optional)"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
              />

              {mobileImage && (
                <div className="h-20 bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                  <img src={mobileImage} alt="Mobile Preview" className="h-full object-contain" />
                </div>
              )}
            </div>
          </div>

          {/* Display Order, Schedule Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={displayOrder}
                onChange={e => setDisplayOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                End Date (Expiry)
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Disabled)</option>
              </select>
            </div>
          </div>

          {/* Interactive Live Preview Box */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-brand-700" />
                <span>Live Banner Preview</span>
              </span>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                    previewViewport === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                    previewViewport === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Desktop Preview Frame */}
            {previewViewport === 'desktop' ? (
              <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-purple-100/70 to-fuchsia-50/50 border border-purple-200/80 p-4 shadow-xs flex items-center justify-between gap-4">
                <div className="max-w-[70%]">
                  <div className="inline-block bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                    Fresh | Affordable | Fast Delivery
                  </div>
                  <h4 className="text-base font-black text-slate-900 leading-tight">
                    {title || 'Daily Groceries Delivered to Your Door'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {subtitle || 'Fresh, affordable and fast delivery'}
                  </p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-brand-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1"
                    >
                      <span>{ctaText || 'Shop Now'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    {discountText && (
                      <span className="text-[10px] font-extrabold text-brand-800 bg-brand-50 border border-brand-200 px-2 py-1 rounded-lg">
                        {discountText}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-24 h-24 flex items-center justify-center">
                  <img
                    src={image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'}
                    alt="Preview"
                    className="w-full h-full object-contain filter drop-shadow-sm"
                  />
                </div>
              </div>
            ) : (
              /* Mobile Preview Frame */
              <div className="max-w-xs mx-auto rounded-2xl bg-gradient-to-br from-purple-50 via-purple-100/70 to-fuchsia-50/50 border border-purple-200/80 p-3 shadow-xs relative">
                {discountText && (
                  <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-rose-600 text-white text-[8px] font-black flex flex-col items-center justify-center rotate-6 shadow-xs border border-white">
                    <span>{discountText.replace('OFF', '').trim()}</span>
                    <span>OFF</span>
                  </div>
                )}
                <div className="w-[68%]">
                  <div className="text-[9px] font-bold text-purple-800 bg-purple-100/90 px-1.5 py-0.5 rounded-full inline-block mb-1">
                    Express 30 Mins
                  </div>
                  <h4 className="text-xs font-black text-slate-900 leading-tight">
                    {title || 'Daily Groceries'}
                  </h4>
                  <button
                    type="button"
                    className="mt-2 px-2.5 py-1 bg-brand-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                  >
                    <span>{ctaText || 'Shop Now'}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 w-16 h-16 flex items-center justify-center">
                  <img
                    src={mobileImage || image}
                    alt="Mobile Preview"
                    className="w-full h-full object-contain filter drop-shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : bannerToEdit ? 'Save Changes' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
