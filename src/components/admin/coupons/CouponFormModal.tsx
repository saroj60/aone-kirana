import React, { useState, useEffect } from 'react';
import { X, Tag, Calendar, Percent, DollarSign, ShieldAlert, Check } from 'lucide-react';
import { Coupon, DiscountType, couponService } from '../../../services/couponService';

interface CouponFormModalProps {
  isOpen: boolean;
  couponToEdit: Coupon | null;
  onClose: () => void;
  onSuccess: (savedCoupon: Coupon) => void;
}

const DISCOUNT_TYPES: { id: DiscountType; label: string; desc: string }[] = [
  { id: 'percentage', label: 'Percentage Discount (%)', desc: 'Discount percentage applied on cart subtotal' },
  { id: 'fixed_amount', label: 'Fixed Amount Discount (Rs.)', desc: 'Flat rupee reduction from subtotal' },
  { id: 'free_delivery', label: 'Free Delivery', desc: 'Waives standard delivery charges' },
  { id: 'category_discount', label: 'Category Discount', desc: 'Percentage off items in specific categories' },
  { id: 'product_discount', label: 'Product Discount', desc: 'Special discount on select grocery products' },
  { id: 'first_order', label: 'First-Order Discount', desc: 'Exclusive promo for first-time shoppers' },
  { id: 'min_order_discount', label: 'Minimum Order Discount', desc: 'Tiered bonus when cart crosses high threshold' }
];

export const CouponFormModal: React.FC<CouponFormModalProps> = ({
  isOpen,
  couponToEdit,
  onClose,
  onSuccess
}) => {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(300);
  const [maxDiscount, setMaxDiscount] = useState<string>('150');
  const [usageLimit, setUsageLimit] = useState<string>('500');
  const [perUserLimit, setPerUserLimit] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [applicableCategories, setApplicableCategories] = useState<string>('Vegetables, Fruits');
  const [applicableProducts, setApplicableProducts] = useState<string>('Taichin Rice, Basmati Rice');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (couponToEdit) {
      setCode(couponToEdit.code);
      setDescription(couponToEdit.description);
      setDiscountType(couponToEdit.discountType);
      setDiscountValue(couponToEdit.discountValue);
      setMinOrder(couponToEdit.minOrder || 0);
      setMaxDiscount(couponToEdit.maxDiscount !== null && couponToEdit.maxDiscount !== undefined ? String(couponToEdit.maxDiscount) : '');
      setUsageLimit(couponToEdit.usageLimit !== null && couponToEdit.usageLimit !== undefined ? String(couponToEdit.usageLimit) : '');
      setPerUserLimit(couponToEdit.perUserLimit || 1);
      setStartDate(couponToEdit.startDate.split('T')[0]);
      setEndDate(couponToEdit.endDate.split('T')[0]);
      setStatus(couponToEdit.status === 'inactive' ? 'inactive' : 'active');
      setApplicableCategories((couponToEdit.applicableCategories || []).join(', '));
      setApplicableProducts((couponToEdit.applicableProducts || []).join(', '));
    } else {
      // Defaults for new coupon
      setCode('');
      setDescription('');
      setDiscountType('percentage');
      setDiscountValue(10);
      setMinOrder(300);
      setMaxDiscount('150');
      setUsageLimit('500');
      setPerUserLimit(1);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]);
      setStatus('active');
      setApplicableCategories('Vegetables, Fruits');
      setApplicableProducts('Basmati Rice, Taichin Rice');
    }
    setErrorMsg(null);
  }, [couponToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!code.trim()) {
      setErrorMsg('Coupon code is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Description is required.');
      return;
    }
    if (discountValue < 0) {
      setErrorMsg('Discount value cannot be negative.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('End date must be on or after start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Coupon> = {
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrder: Number(minOrder) || 0,
        maxDiscount: maxDiscount.trim() !== '' ? Number(maxDiscount) : null,
        usageLimit: usageLimit.trim() !== '' ? Number(usageLimit) : null,
        perUserLimit: Number(perUserLimit) || 1,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate + 'T23:59:59.999Z').toISOString(),
        status,
        applicableCategories:
          discountType === 'category_discount'
            ? applicableCategories.split(',').map(s => s.trim()).filter(Boolean)
            : [],
        applicableProducts:
          discountType === 'product_discount'
            ? applicableProducts.split(',').map(s => s.trim()).filter(Boolean)
            : []
      };

      let result: Coupon;
      if (couponToEdit) {
        result = await couponService.updateCoupon(couponToEdit.id || couponToEdit._id!, payload);
      } else {
        result = await couponService.createCoupon(payload);
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {couponToEdit ? `Edit Coupon #${couponToEdit.code}` : 'Create New Coupon'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Setup discount rules, usage limits, and eligibility constraints
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
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Code & Discount Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. AONE20"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Uppercase, alphanumeric letters only</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Discount Type *
              </label>
              <select
                value={discountType}
                onChange={e => setDiscountType(e.target.value as DiscountType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                {DISCOUNT_TYPES.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. 10% discount on groceries above Rs. 500"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Discount Value & Max Cap */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {discountType === 'percentage' || discountType === 'category_discount'
                  ? 'Discount (%) *'
                  : discountType === 'free_delivery'
                  ? 'Delivery Fee Waived'
                  : 'Discount (Rs.) *'}
              </label>
              <input
                type="number"
                min="0"
                required
                value={discountValue}
                onChange={e => setDiscountValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Minimum Order (Rs.)
              </label>
              <input
                type="number"
                min="0"
                value={minOrder}
                onChange={e => setMinOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Discount (Cap Rs.)
              </label>
              <input
                type="number"
                min="0"
                value={maxDiscount}
                onChange={e => setMaxDiscount(e.target.value)}
                placeholder="Optional cap"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Conditional: Category Discount inputs */}
          {discountType === 'category_discount' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                Applicable Categories (Comma separated)
              </label>
              <input
                type="text"
                value={applicableCategories}
                onChange={e => setApplicableCategories(e.target.value)}
                placeholder="e.g. Vegetables, Fruits, Grains"
                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs focus:outline-hidden font-medium"
              />
              <span className="text-[10px] text-amber-700 mt-1 block">
                Discount only applies to cart items belonging to these categories
              </span>
            </div>
          )}

          {/* Conditional: Product Discount inputs */}
          {discountType === 'product_discount' && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl">
              <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                Applicable Products (Comma separated)
              </label>
              <input
                type="text"
                value={applicableProducts}
                onChange={e => setApplicableProducts(e.target.value)}
                placeholder="e.g. Taichin Rice, Basmati Rice"
                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs focus:outline-hidden font-medium"
              />
              <span className="text-[10px] text-blue-700 mt-1 block">
                Discount only applies if these specific grocery items are in cart
              </span>
            </div>
          )}

          {/* Limits: Global usage & Per-user limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Usage Limit
              </label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={e => setUsageLimit(e.target.value)}
                placeholder="Leave blank for unlimited"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Per-User Limit
              </label>
              <input
                type="number"
                min="1"
                required
                value={perUserLimit}
                onChange={e => setPerUserLimit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden cursor-pointer"
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="active">Active (Available)</option>
                <option value="inactive">Inactive (Disabled)</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
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
              {isSubmitting ? 'Saving...' : couponToEdit ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
