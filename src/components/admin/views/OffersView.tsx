import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Percent,
  DollarSign,
  Truck,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Layers,
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  couponService,
  Coupon,
  CouponStats,
  DiscountType
} from '../../../services/couponService';
import { CouponFormModal } from '../coupons/CouponFormModal';
import { CouponStatsModal } from '../coupons/CouponStatsModal';
import { CouponValidatorTesterModal } from '../coupons/CouponValidatorTesterModal';

export const OffersView: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats>({
    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    totalRedemptions: 0,
    totalDiscountGranted: 0,
    byType: {}
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<Coupon | null>(null);
  const [statsCoupon, setStatsCoupon] = useState<Coupon | null>(null);
  const [testerOpen, setTesterOpen] = useState(false);
  const [testCode, setTestCode] = useState('AONE10');

  // Copy feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [couponsData, statsData] = await Promise.all([
        couponService.getCoupons(),
        couponService.getStats()
      ]);
      setCoupons(couponsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'expired'
          ? c.status === 'expired' || new Date() > new Date(c.endDate)
          : c.status === statusFilter;

      const matchesType = typeFilter === 'all' || c.discountType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [coupons, searchTerm, statusFilter, typeFilter]);

  // Actions
  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const updated = await couponService.toggleStatus(coupon.id || coupon._id!);
      setCoupons(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      const newStats = await couponService.getStats();
      setStats(newStats);
    } catch (e: any) {
      alert(e?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon '${code}'?`)) return;
    try {
      await couponService.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id && c._id !== id));
      const newStats = await couponService.getStats();
      setStats(newStats);
    } catch (e: any) {
      alert(e?.message || 'Failed to delete coupon');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const openTester = (code: string) => {
    setTestCode(code);
    setTesterOpen(true);
  };

  const getDiscountTypeBadge = (type: DiscountType) => {
    switch (type) {
      case 'percentage':
        return { label: 'Percentage', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'fixed_amount':
        return { label: 'Fixed Amount', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'free_delivery':
        return { label: 'Free Delivery', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'category_discount':
        return { label: 'Category', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'product_discount':
        return { label: 'Product Specific', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'first_order':
        return { label: 'First Order', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'min_order_discount':
        return { label: 'Tiered Bulk', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
      default:
        return { label: type, bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Offers & Coupon Management</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 border border-brand-200">
                  Backend Verified
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Create promotional discount rules, set customer usage limits, and validate coupons securely on the server
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Quick Inspector / Validator Tool */}
          <button
            onClick={() => {
              setTestCode('AONE10');
              setTesterOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl text-xs font-bold border border-indigo-200/80 transition shadow-xs"
            title="Open Server-side Coupon Validator Inspector"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Test Validator</span>
          </button>

          <button
            onClick={fetchData}
            title="Refresh coupons"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-700' : ''}`} />
          </button>

          <button
            onClick={() => {
              setCouponToEdit(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-700/10 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Coupons */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Coupons</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalCoupons}</div>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">
              {stats.expiredCoupons} expired / scheduled
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Active Offers */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Promo Codes</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.activeCoupons}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Available for checkout</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Redemptions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Redemptions</span>
            <div className="text-2xl font-black text-brand-700 mt-1">{stats.totalRedemptions}</div>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Across all customers</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Discount Granted */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Customer Savings</span>
            <div className="text-2xl font-black text-amber-700 mt-1">
              Rs. {stats.totalDiscountGranted.toLocaleString()}
            </div>
            <p className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Promotional value</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by coupon code (e.g. AONE10) or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-500">Type:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Discount Types</option>
              <option value="percentage">Percentage Discount</option>
              <option value="fixed_amount">Fixed Amount</option>
              <option value="free_delivery">Free Delivery</option>
              <option value="category_discount">Category Discount</option>
              <option value="product_discount">Product Discount</option>
              <option value="first_order">First Order</option>
              <option value="min_order_discount">Minimum Order Tier</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Coupons Content */}
      {filteredCoupons.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center shadow-xs">
          <Tag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No coupons match your criteria</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, status or discount type filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setTypeFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map(coupon => {
            const isExpired = new Date() > new Date(coupon.endDate);
            const typeBadge = getDiscountTypeBadge(coupon.discountType);
            const usagePercent =
              coupon.usageLimit && coupon.usageLimit > 0
                ? Math.min(100, Math.round((coupon.usageCount / coupon.usageLimit) * 100))
                : null;

            return (
              <div
                key={coupon.id || coupon._id}
                className={`bg-white rounded-3xl p-5 border shadow-xs flex flex-col justify-between transition hover:border-brand-300 ${
                  coupon.status === 'inactive'
                    ? 'border-slate-200/60 opacity-80'
                    : isExpired
                    ? 'border-rose-200/60'
                    : 'border-slate-200/80'
                }`}
              >
                <div>
                  {/* Top Bar: Code & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        title="Click to copy coupon code"
                        className="font-mono text-xs font-black text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-xl border border-brand-200 flex items-center gap-1.5 transition"
                      >
                        <span>{coupon.code}</span>
                        {copiedCode === coupon.code ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-brand-500" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          coupon.status === 'inactive'
                            ? 'bg-slate-100 text-slate-600 border-slate-300'
                            : isExpired
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {coupon.status === 'inactive'
                          ? 'Inactive'
                          : isExpired
                          ? 'Expired'
                          : 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Discount Headline */}
                  <div className="flex items-baseline justify-between gap-2 mt-1">
                    <h3 className="text-xl font-black text-slate-900">
                      {coupon.discountType === 'percentage' || coupon.discountType === 'category_discount' ? (
                        <span>{coupon.discountValue}% OFF</span>
                      ) : coupon.discountType === 'free_delivery' ? (
                        <span>FREE DELIVERY</span>
                      ) : (
                        <span>Rs. {coupon.discountValue} OFF</span>
                      )}
                    </h3>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadge.bg}`}
                    >
                      {typeBadge.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{coupon.description}</p>

                  {/* Constraints Pills */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Min Order</span>
                      <span className="font-extrabold text-slate-800">
                        {coupon.minOrder > 0 ? `Rs. ${coupon.minOrder}` : 'No Min'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Max Cap</span>
                      <span className="font-extrabold text-slate-800">
                        {coupon.maxDiscount ? `Rs. ${coupon.maxDiscount}` : 'No Cap'}
                      </span>
                    </div>
                  </div>

                  {/* Redemptions progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400 font-semibold">Usage:</span>
                      <span className="font-bold text-slate-700">
                        {coupon.usageCount}{' '}
                        {coupon.usageLimit ? `/ ${coupon.usageLimit} limit` : 'times'}
                      </span>
                    </div>
                    {usagePercent !== null && (
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-brand-600 h-full rounded-full transition-all"
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Validity window */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      Valid until:{' '}
                      <strong className="text-slate-600">
                        {new Date(coupon.endDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(coupon)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-xl transition ${
                        coupon.status === 'active'
                          ? 'text-slate-500 hover:bg-slate-100'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {coupon.status === 'active' ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      onClick={() => openTester(coupon.code)}
                      title="Test backend validation with this code"
                      className="text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-xl transition"
                    >
                      Test
                    </button>

                    <button
                      onClick={() => setStatsCoupon(coupon)}
                      title="View redemptions stats and history"
                      className="text-[11px] font-bold text-brand-700 hover:bg-brand-50 px-2 py-1 rounded-xl transition flex items-center gap-1"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Stats</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCouponToEdit(coupon);
                        setIsFormOpen(true);
                      }}
                      title="Edit Coupon"
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-xl transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(coupon.id || coupon._id!, coupon.code)}
                      title="Delete Coupon"
                      className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-xl transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount & Type</th>
                  <th className="py-3.5 px-4">Min. Order / Cap</th>
                  <th className="py-3.5 px-4">Redemptions</th>
                  <th className="py-3.5 px-4">Validity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCoupons.map(coupon => {
                  const isExpired = new Date() > new Date(coupon.endDate);
                  const typeBadge = getDiscountTypeBadge(coupon.discountType);

                  return (
                    <tr key={coupon.id || coupon._id} className="hover:bg-slate-50/60 transition">
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="font-mono text-xs font-black text-brand-800 bg-brand-50 hover:bg-brand-100 px-2 py-0.5 rounded-lg border border-brand-200 inline-flex items-center gap-1"
                          >
                            <span>{coupon.code}</span>
                            <Copy className="w-3 h-3 text-brand-500" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs mt-1">
                          {coupon.description}
                        </div>
                      </td>

                      {/* Discount & Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {coupon.discountType === 'percentage' || coupon.discountType === 'category_discount'
                            ? `${coupon.discountValue}% OFF`
                            : coupon.discountType === 'free_delivery'
                            ? 'FREE DELIVERY'
                            : `Rs. ${coupon.discountValue} OFF`}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${typeBadge.bg}`}
                        >
                          {typeBadge.label}
                        </span>
                      </td>

                      {/* Constraints */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700">
                          Min: {coupon.minOrder > 0 ? `Rs. ${coupon.minOrder}` : 'None'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Cap: {coupon.maxDiscount ? `Rs. ${coupon.maxDiscount}` : 'No cap'}
                        </div>
                      </td>

                      {/* Redemptions */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {coupon.usageCount}{' '}
                          {coupon.usageLimit && <span className="text-slate-400 font-normal">/ {coupon.usageLimit}</span>}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          Rs. {coupon.totalDiscountGiven.toLocaleString()} saved
                        </div>
                      </td>

                      {/* Validity */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-medium">
                          {new Date(coupon.endDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          From: {new Date(coupon.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border inline-block ${
                            coupon.status === 'inactive'
                              ? 'bg-slate-100 text-slate-600 border-slate-300'
                              : isExpired
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {coupon.status === 'inactive'
                            ? 'Inactive'
                            : isExpired
                            ? 'Expired'
                            : 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openTester(coupon.code)}
                            title="Test Validator"
                            className="px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold transition"
                          >
                            Test
                          </button>
                          <button
                            onClick={() => setStatsCoupon(coupon)}
                            title="Stats"
                            className="p-1.5 hover:bg-brand-50 text-brand-700 rounded-lg transition"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setCouponToEdit(coupon);
                              setIsFormOpen(true);
                            }}
                            title="Edit"
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id || coupon._id!, coupon.code)}
                            title="Delete"
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Create/Edit Coupon Modal */}
      <CouponFormModal
        isOpen={isFormOpen}
        couponToEdit={couponToEdit}
        onClose={() => {
          setIsFormOpen(false);
          setCouponToEdit(null);
        }}
        onSuccess={() => {
          fetchData();
        }}
      />

      {/* 2. Coupon Stats & Redemptions Modal */}
      <CouponStatsModal
        isOpen={!!statsCoupon}
        coupon={statsCoupon}
        onClose={() => setStatsCoupon(null)}
      />

      {/* 3. Server Validator Inspector Tool */}
      <CouponValidatorTesterModal
        isOpen={testerOpen}
        initialCode={testCode}
        onClose={() => setTesterOpen(false)}
      />
    </div>
  );
};
