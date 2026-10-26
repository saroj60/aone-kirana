export interface Banner {
  id: string;
  _id?: string;
  title: string;
  subtitle: string;
  image: string; // Desktop
  mobileImage?: string; // Mobile
  discountText: string;
  ctaText: string;
  ctaDestination: string;
  badgeText?: string;
  deliveryTime?: string;
  deliveryRadius?: string;
  qualityText?: string;
  stampText?: string;
  bgColor?: string;
  borderColor?: string;
  startDate: string;
  endDate: string;
  displayOrder: number;
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  clickCount?: number;
  createdAt?: string;
}

const STORAGE_BANNERS_KEY = 'aone_homepage_banners_v2';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-001',
    title: 'Daily Groceries Delivered to Your Door',
    subtitle: 'Fresh, affordable and fast delivery across Lalitpur',
    image: '/hero_banner.jpg',
    mobileImage: '/hero_banner.jpg',
    discountText: 'UP TO 20% OFF',
    ctaText: 'Shop Now',
    ctaDestination: '/category/all',
    badgeText: 'Fresh | Affordable | Fast Delivery',
    deliveryTime: 'Delivery in 30–60 mins',
    deliveryRadius: '3 km Radius (Tikathali & Nearby)',
    qualityText: 'Quality Products Everyday',
    stampText: 'Fresh Healthy Affordable',
    bgColor: 'from-purple-50 via-purple-100/70 to-fuchsia-50/50',
    borderColor: 'border-purple-200/80',
    startDate: new Date('2025-01-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    displayOrder: 1,
    status: 'active',
    clickCount: 524,
    createdAt: new Date('2025-01-01').toISOString()
  }
];

// Presets for quick selection
export const BANNER_PRESETS = [
  {
    title: 'Daily Groceries Delivered to Your Door',
    subtitle: 'Fresh, affordable and fast delivery across Lalitpur',
    discountText: 'UP TO 20% OFF',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    bgColor: 'from-purple-50 via-purple-100/70 to-fuchsia-50/50',
    borderColor: 'border-purple-200/80'
  },
  {
    title: 'Daily Essentials At Best Local Price',
    subtitle: 'Pure grains, cooking oils & daily pantry staples',
    discountText: 'FLAT 15% OFF',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80',
    bgColor: 'from-amber-50 via-orange-50/70 to-yellow-50/40',
    borderColor: 'border-amber-200/80'
  },
  {
    title: 'Farm Fresh Vegetables & Seasonal Fruits',
    subtitle: 'Hand-picked morning harvest delivered straight to your kitchen',
    discountText: 'UP TO 25% OFF',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&auto=format&fit=crop&q=80',
    bgColor: 'from-emerald-50 via-teal-50/80 to-green-50/50',
    borderColor: 'border-teal-200/80'
  },
  {
    title: 'Chilled Milk & Fresh Morning Dairy',
    subtitle: 'Farm cow milk, pure ghee, curd & bakery butter',
    discountText: 'BEST LOCAL RATES',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80',
    bgColor: 'from-blue-50 via-sky-50/80 to-indigo-50/50',
    borderColor: 'border-blue-200/80'
  },
  {
    title: 'Crisp Snacks & Evening Refreshment',
    subtitle: 'Biscuits, noodles, chips, teas and cold drinks',
    discountText: 'COMBO SAVINGS',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop&q=80',
    bgColor: 'from-rose-50 via-orange-50/70 to-yellow-50/50',
    borderColor: 'border-rose-200/80'
  }
];

class BannerService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('aone_admin_jwt_token') || sessionStorage.getItem('aone_admin_jwt_token');
    if (token) return { Authorization: `Bearer ${token}` };
    return {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsInJvbGUiOiJhZG1pbiJ9.mock_jwt_signature`
    };
  }

  private notifyUpdate() {
    window.dispatchEvent(new Event('aone_banners_updated'));
  }

  /**
   * 1. Public API: Fetch Active Banners for Storefront
   */
  async getActiveBanners(): Promise<Banner[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/banners/active`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((b: any) => ({ ...b, id: b._id || b.id }));
          return mapped;
        }
      }
    } catch (e) {
      console.warn('Backend banners/active offline, using local fallback:', e);
    }

    // Local fallback: filter active & within date bounds
    const now = new Date();
    const list = this.getFromStorage();
    const active = list
      .filter(b => {
        if (b.status !== 'active') return false;
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        return now >= start && now <= end;
      })
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return active.length > 0 ? active : INITIAL_BANNERS.slice(0, 1);
  }

  /**
   * 2. Admin API: Fetch All Banners
   */
  async getAllBanners(search?: string, status?: string): Promise<Banner[]> {
    try {
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (status && status !== 'all') q.append('status', status);

      const res = await fetch(`${API_BASE_URL}/banners?${q.toString()}`, {
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((b: any) => ({ ...b, id: b._id || b.id }));
          this.saveToStorage(mapped);
          return mapped;
        }
      }
    } catch (e) {
      console.warn('Backend banners API offline, using local fallback:', e);
    }

    // Local fallback
    let list = this.getFromStorage();
    if (search) {
      const query = search.toLowerCase();
      list = list.filter(
        b =>
          b.title.toLowerCase().includes(query) ||
          b.subtitle.toLowerCase().includes(query) ||
          b.discountText.toLowerCase().includes(query)
      );
    }
    if (status && status !== 'all') {
      list = list.filter(b => b.status === status);
    }
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  /**
   * 3. Create Banner
   */
  async createBanner(data: Partial<Banner>): Promise<Banner> {
    try {
      const res = await fetch(`${API_BASE_URL}/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const created = { ...json.data, id: json.data._id || json.data.id };
          const list = this.getFromStorage();
          list.push(created);
          this.saveToStorage(list);
          this.notifyUpdate();
          return created;
        }
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create banner');
      }
    } catch (e: any) {
      if (e?.message && !e.message.includes('Failed to fetch')) throw e;
    }

    // Local fallback
    const list = this.getFromStorage();
    const newBanner: Banner = {
      id: `banner-${Date.now()}`,
      title: data.title || 'Special Promotion',
      subtitle: data.subtitle || 'Shop fresh local groceries',
      image: data.image || INITIAL_BANNERS[0].image,
      mobileImage: data.mobileImage || data.image || INITIAL_BANNERS[0].mobileImage,
      discountText: data.discountText || 'UP TO 20% OFF',
      ctaText: data.ctaText || 'Shop Now',
      ctaDestination: data.ctaDestination || '/category/all',
      badgeText: data.badgeText || 'Fresh | Affordable | Fast Delivery',
      deliveryTime: data.deliveryTime || 'Delivery in 30–60 mins',
      deliveryRadius: data.deliveryRadius || '3 km Radius (Tikathali & Nearby)',
      qualityText: data.qualityText || 'Quality Products Everyday',
      stampText: data.stampText || 'Fresh Healthy Affordable',
      bgColor: data.bgColor || 'from-purple-50 via-purple-100/70 to-fuchsia-50/50',
      borderColor: data.borderColor || 'border-purple-200/80',
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + 60 * 86400000).toISOString(),
      displayOrder: data.displayOrder || list.length + 1,
      status: data.status || 'active',
      clickCount: 0,
      createdAt: new Date().toISOString()
    };

    list.push(newBanner);
    this.saveToStorage(list);
    this.notifyUpdate();
    return newBanner;
  }

  /**
   * 4. Update Banner
   */
  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner> {
    try {
      const res = await fetch(`${API_BASE_URL}/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updated = { ...json.data, id: json.data._id || json.data.id };
          this.updateLocalBanner(updated);
          this.notifyUpdate();
          return updated;
        }
      }
    } catch (e) {
      // fallback
    }

    const list = this.getFromStorage();
    const idx = list.findIndex(b => b.id === id || b._id === id);
    if (idx === -1) throw new Error('Banner not found');

    list[idx] = { ...list[idx], ...updates };
    this.saveToStorage(list);
    this.notifyUpdate();
    return list[idx];
  }

  /**
   * 5. Toggle Banner Status (active <-> inactive)
   */
  async toggleStatus(id: string): Promise<Banner> {
    try {
      const res = await fetch(`${API_BASE_URL}/banners/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updated = { ...json.data, id: json.data._id || json.data.id };
          this.updateLocalBanner(updated);
          this.notifyUpdate();
          return updated;
        }
      }
    } catch (e) {
      // fallback
    }

    const list = this.getFromStorage();
    const idx = list.findIndex(b => b.id === id || b._id === id);
    if (idx === -1) throw new Error('Banner not found');

    list[idx].status = list[idx].status === 'active' ? 'inactive' : 'active';
    this.saveToStorage(list);
    this.notifyUpdate();
    return list[idx];
  }

  /**
   * 6. Reorder Banners
   */
  async reorderBanners(orders: { id: string; displayOrder: number }[]): Promise<Banner[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/banners/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify({ orders })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((b: any) => ({ ...b, id: b._id || b.id }));
          this.saveToStorage(mapped);
          this.notifyUpdate();
          return mapped;
        }
      }
    } catch (e) {
      // fallback
    }

    const list = this.getFromStorage();
    orders.forEach(o => {
      const b = list.find(x => x.id === o.id || x._id === o.id);
      if (b) b.displayOrder = o.displayOrder;
    });

    list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    this.saveToStorage(list);
    this.notifyUpdate();
    return list;
  }

  /**
   * 7. Delete Banner
   */
  async deleteBanner(id: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });
      if (res.ok) {
        const list = this.getFromStorage().filter(b => b.id !== id && b._id !== id);
        this.saveToStorage(list);
        this.notifyUpdate();
        return;
      }
    } catch (e) {
      // fallback
    }

    const list = this.getFromStorage().filter(b => b.id !== id && b._id !== id);
    this.saveToStorage(list);
    this.notifyUpdate();
  }

  /**
   * 8. Record Banner Click
   */
  async recordClick(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/banners/${id}/click`, { method: 'POST' });
    } catch (e) {
      // ignore
    }
  }

  // --- Storage Helpers ---
  private getFromStorage(): Banner[] {
    try {
      const raw = localStorage.getItem(STORAGE_BANNERS_KEY);
      if (!raw) {
        this.saveToStorage(INITIAL_BANNERS);
        return [...INITIAL_BANNERS];
      }
      const parsed = JSON.parse(raw);
      // Filter out removed banners (banner-002, banner-003, banner-004)
      const filtered = parsed.filter(
        (b: Banner) =>
          b.id !== 'banner-002' &&
          b.id !== 'banner-003' &&
          b.id !== 'banner-004' &&
          b._id !== 'banner-002' &&
          b._id !== 'banner-003' &&
          b._id !== 'banner-004'
      );
      const listToUse = filtered.length > 0 ? filtered : INITIAL_BANNERS;
      this.saveToStorage(listToUse);
      // Ensure banner-001 always uses the uploaded hero banner
      return listToUse.map((b: Banner) =>
        b.id === 'banner-001'
          ? { ...b, image: '/hero_banner.jpg', mobileImage: '/hero_banner.jpg' }
          : b
      );
    } catch (e) {
      return [...INITIAL_BANNERS];
    }
  }

  private saveToStorage(banners: Banner[]): void {
    localStorage.setItem(STORAGE_BANNERS_KEY, JSON.stringify(banners));
  }

  private updateLocalBanner(banner: Banner): void {
    const list = this.getFromStorage();
    const idx = list.findIndex(b => b.id === banner.id || b._id === banner.id);
    if (idx !== -1) list[idx] = banner;
    else list.push(banner);
    this.saveToStorage(list);
  }
}

export const bannerService = new BannerService();
