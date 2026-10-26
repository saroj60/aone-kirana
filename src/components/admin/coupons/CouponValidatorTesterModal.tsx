import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, ShoppingCart, RefreshCw } from 'lucide-react';
import { couponService, CouponValidationResult } from '../../../services/couponService';

interface CouponValidatorTesterModalProps {
  isOpen: boolean;
  initialCode?: string;
  onClose: () => void;
}

export const CouponValidatorTesterModal: React.FC<CouponValidatorTesterModalProps> = ({
  isOpen,
  initialCode = 'AONE10',
  onClose
}) => {
  const [code, setCode] = useState(initialCode);
  const [subtotal, setSubtotal] = useState(650);
  const [deliveryFee, setDeliveryFee] = useState(40);
  const [userEmail, setUserEmail] = useState('customer@example.com');
  const [includeVegItems, setIncludeVegItems] = useState(true);
  const [includeRiceItems, setIncludeRiceItems] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<CouponValidationResult | null>(null);

  if (!isOpen) return null;

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsValidating(true);
    setResult(null);

    // Build sample cart items
    const sampleCart = [];
    if (includeVegItems) {
      sampleCart.push(
        { name: 'Fresh Red Tomatoes', price: 60, quantity: 2, category: 'Vegetables' },
        { name: 'Organic Spinach (Palungo)', price: 40, quantity: 1, category: 'Vegetables' },
        { name: 'Crisp Royal Apples', price: 180, quantity: 1, category: 'Fruits' }
      );
    }
    if (includeRiceItems) {
      sampleCart.push({ name: 'Basmati Rice Premium 5kg', price: 450, quantity: 1, category: 'Grains' });
    }

    try {
      const res = await couponService.validateCoupon({
        code: code.trim().toUpperCase(),
        subtotal: Number(subtotal),
        deliveryFee: Number(deliveryFee),
        userEmail: userEmail.trim(),
        cartItems: sampleCart
      });
      setResult(res);
    } catch (err: any) {
      setResult({
        valid: false,
        message: err?.message || 'Server returned an error while validating'
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Backend Coupon Validator Inspector</h3>
              <p className="text-[11px] text-slate-400">
                Tests server-side API verification (/api/coupons/validate)
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

        {/* Content */}
        <form onSubmit={handleValidate} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Test Coupon Code
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. AONE10, FREEDEL, VEG20, WELCOME100"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={isValidating}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Validate</span>
              </button>
            </div>
          </div>

          {/* Test parameters */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Simulated Checkout Context
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Cart Subtotal (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={subtotal}
                  onChange={e => setSubtotal(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Delivery Fee (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={deliveryFee}
                  onChange={e => setDeliveryFee(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includeVegItems}
                  onChange={e => setIncludeVegItems(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Include Veg/Fruits in cart</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includeRiceItems}
                  onChange={e => setIncludeRiceItems(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Include Basmati Rice in cart</span>
              </label>
            </div>
          </div>

          {/* Validation Result Output */}
          {result && (
            <div
              className={`p-4 rounded-2xl border transition animate-fadeIn ${
                result.valid
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                {result.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                )}
                <span className="text-xs">
                  {result.valid ? 'Coupon Verified & Authorized by Server' : 'Validation Failed by Server'}
                </span>
              </div>

              <p className="text-xs mt-1 font-medium">{result.message}</p>

              {result.valid && (
                <div className="mt-3 pt-3 border-t border-emerald-200/80 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white/80 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Discount</span>
                    <span className="font-extrabold text-emerald-700 text-sm">
                      Rs. {result.discountAmount}
                    </span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Type</span>
                    <span className="font-bold text-slate-800 text-[11px] capitalize">
                      {result.coupon?.discountType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">New Subtotal</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      Rs. {result.finalSubtotal}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Close button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
