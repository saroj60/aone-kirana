import React, { useState, useEffect, useMemo } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  ExternalLink,
  Smartphone,
  Monitor,
  MousePointerClick,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Banner, bannerService } from '../../../services/bannerService';
import { BannerFormModal } from '../banners/BannerFormModal';
import { BannerPreviewModal } from '../banners/BannerPreviewModal';

export const BannersView: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bannerToEdit, setBannerToEdit] = useState<Banner | null>(null);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await bannerService.getAllBanners();
      setBanners(data);
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Filtered banners
  const filteredBanners = useMemo(() => {
    return banners.filter(b => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        b.title.toLowerCase().includes(q) ||
        b.subtitle.toLowerCase().includes(q) ||
        b.discountText.toLowerCase().includes(q);

      const isExpired = new Date() > new Date(b.endDate);
      const isScheduled = new Date() < new Date(b.startDate);

      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = b.status === 'active' && !isExpired && !isScheduled;
      else if (statusFilter === 'inactive') matchesStatus = b.status === 'inactive';
      else if (statusFilter === 'scheduled') matchesStatus = isScheduled;
      else if (statusFilter === 'expired') matchesStatus = isExpired;

      return matchesSearch && matchesStatus;
    });
  }, [banners, searchTerm, statusFilter]);

  // KPI calculations
  const stats = useMemo(() => {
    const now = new Date();
    const total = banners.length;
    const active = banners.filter(b => b.status === 'active' && now >= new Date(b.startDate) && now <= new Date(b.endDate)).length;
    const scheduled = banners.filter(b => now < new Date(b.startDate)).length;
    const totalClicks = banners.reduce((sum, b) => sum + (b.clickCount || 0), 0);
    return { total, active, scheduled, totalClicks };
  }, [banners]);

  // Actions
  const handleToggleStatus = async (banner: Banner) => {
    try {
      const updated = await bannerService.toggleStatus(banner.id || banner._id!);
      setBanners(prev => prev.map(b => (b.id === updated.id ? updated : b)));
    } catch (e: any) {
      alert(e?.message || 'Failed to toggle banner status');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove banner "${title}"?`)) return;
    try {
      await bannerService.deleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id && b._id !== id));
    } catch (e: any) {
      alert(e?.message || 'Failed to delete banner');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    // Reassign displayOrder sequentially
    const orders = newBanners.map((b, idx) => ({
      id: b.id || b._id!,
      displayOrder: idx + 1
    }));

    setBanners(newBanners.map((b, idx) => ({ ...b, displayOrder: idx + 1 })));

    try {
      await bannerService.reorderBanners(orders);
    } catch (e) {
      console.warn('Failed to save reordered banners', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Homepage Banner Management</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 border border-brand-200">
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Control customer hero sliders, desktop and mobile graphics, CTA links, and campaign schedules
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchBanners}
            title="Refresh Banners"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-700' : ''}`} />
          </button>

          <button
            onClick={() => {
              setBannerToEdit(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-700/10 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Banner</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Banners */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Banners</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Configured in store</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Active Sliders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active On Storefront</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.active}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Visible in customer hero</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Scheduled Campaigns */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Ahead</span>
            <div className="text-2xl font-black text-brand-700 mt-1">{stats.scheduled}</div>
            <p className="text-[11px] text-brand-600 font-semibold mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Future launch dates</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Total Clicks */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Engagement</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{stats.totalClicks}</div>
            <p className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
              <MousePointerClick className="w-3 h-3" />
              <span>CTA button clicks</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
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
            placeholder="Search banners by title, subtitle, or discount text..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Banners</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="scheduled">Scheduled Only</option>
              <option value="expired">Expired Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banners List */}
      {filteredBanners.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center shadow-xs">
          <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No banners found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or create a new banner for your storefront.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredBanners.map((banner, index) => {
            const isExpired = new Date() > new Date(banner.endDate);
            const isScheduled = new Date() < new Date(banner.startDate);

            return (
              <div
                key={banner.id || banner._id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand-300 transition"
              >
                {/* Left: Reorder Controls + Image Thumbnails */}
                <div className="flex items-center gap-3.5">
                  {/* Up / Down Reorder */}
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      title="Move slide up"
                      className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-black text-brand-800 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200">
                      #{banner.displayOrder}
                    </span>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === banners.length - 1}
                      title="Move slide down"
                      className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail Previews */}
                  <div className="relative w-28 h-20 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-contain p-1"
                    />
                    {banner.mobileImage && banner.mobileImage !== banner.image && (
                      <span
                        title="Mobile-optimized graphic attached"
                        className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
                      >
                        <Smartphone className="w-2.5 h-2.5" />
                        <span>M</span>
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          banner.status === 'inactive'
                            ? 'bg-slate-100 text-slate-600 border-slate-300'
                            : isExpired
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : isScheduled
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {banner.status === 'inactive'
                          ? 'Inactive'
                          : isExpired
                          ? 'Expired'
                          : isScheduled
                          ? 'Scheduled'
                          : 'Active (Live)'}
                      </span>

                      {banner.discountText && (
                        <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                          {banner.discountText}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm">{banner.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{banner.subtitle}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span>
                        CTA: <strong className="text-slate-700">{banner.ctaText}</strong> ({banner.ctaDestination})
                      </span>
                      <span>•</span>
                      <span>
                        Valid until:{' '}
                        <strong className="text-slate-700">
                          {new Date(banner.endDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Status toggle */}
                  <button
                    onClick={() => handleToggleStatus(banner)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      banner.status === 'active'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {banner.status === 'active' ? 'Disable' : 'Enable'}
                  </button>

                  {/* Preview */}
                  <button
                    onClick={() => setPreviewBanner(banner)}
                    title="Live Preview"
                    className="p-2 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 rounded-xl transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => {
                      setBannerToEdit(banner);
                      setIsFormOpen(true);
                    }}
                    title="Edit Banner"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(banner.id || banner._id!, banner.title)}
                    title="Delete Banner"
                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      {/* 1. Create / Edit Banner Modal */}
      <BannerFormModal
        isOpen={isFormOpen}
        bannerToEdit={bannerToEdit}
        onClose={() => {
          setIsFormOpen(false);
          setBannerToEdit(null);
        }}
        onSuccess={() => {
          fetchBanners();
        }}
      />

      {/* 2. Interactive Live Preview Modal */}
      <BannerPreviewModal
        isOpen={!!previewBanner}
        banner={previewBanner}
        onClose={() => setPreviewBanner(null)}
      />
    </div>
  );
};
