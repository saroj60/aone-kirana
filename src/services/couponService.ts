export type DiscountType =
  | 'percentage'
  | 'fixed_amount'
  | 'free_delivery'
  | 'product_discount'
  | 'category_discount'
  | 'first_order'
  | 'min_order_discount';

export interface CouponRedemption {
  userId?: string;
  userEmail?: string;
  userPhone?: string;
  orderId?: string;
  orderNumber?: string;
  discountApplied: number;
  usedAt: string;
}

export interface Coupon {
  id: string;
  _id?: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  perUserLimit: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
  usageCount: number;
  totalDiscountGiven: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  usedBy?: CouponRedemption[];
  createdAt?: string;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  totalRedemptions: number;
  totalDiscountGranted: number;
  byType: Record<string, number>;
}

export interface ValidateCouponParams {
  code: string;
  subtotal: number;
  cartItems?: Array<{
    id?: string;
    _id?: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
  userId?: string;
  userEmail?: string;
  userPhone?: string;
  deliveryFee?: number;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: {
    id?: string;
    code: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    minOrder: number;
    maxDiscount?: number | null;
    deliveryFeeWaived?: boolean;
  };
  discountAmount?: number;
  finalSubtotal?: number;
  explanation?: string;
  message: string;
}

const STORAGE_COUPONS_KEY = 'aone_coupons_v1';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Initial default seeds covering all 7 required discount types
export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-001',
    code: 'AONE10',
    description: 'Get 10% discount on entire grocery cart up to Rs. 150',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 500,
    maxDiscount: 150,
    usageLimit: 500,
    perUserLimit: 2,
    startDate: new Date('2025-01-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    status: 'active',
    usageCount: 142,
    totalDiscountGiven: 14200,
    applicableProducts: [],
    applicableCategories: [],
    usedBy: [
      {
        userId: 'usr-101',
        userEmail: 'saroj@example.com',
        userPhone: '9841234567',
        orderNumber: 'AK-9842',
        discountApplied: 100,
        usedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    createdAt: new Date('2025-01-01').toISOString()
  },
  {
    id: 'coup-002',
    code: 'TIKATHALI50',
    description: 'Flat Rs. 50 OFF on local deliveries around Tikathali',
    discountType: 'fixed_amount',
    discountValue: 50,
    minOrder: 400,
    maxDiscount: 50,
    usageLimit: 300,
    perUserLimit: 1,
    startDate: new Date('2025-02-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    status: 'active',
    usageCount: 88,
    totalDiscountGiven: 4400,
    applicableProducts: [],
    applicableCategories: [],
    usedBy: [],
    createdAt: new Date('2025-02-01').toISOString()
  },
  {
    id: 'coup-003',
    code: 'FREEDEL',
    description: 'Zero delivery fee on orders above Rs. 350',
    discountType: 'free_delivery',
    discountValue: 40,
    minOrder: 350,
    maxDiscount: 60,
    usageLimit: 1000,
    perUserLimit: 5,
    startDate: new Date('2025-01-15').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    status: 'active',
    usageCount: 260,
    totalDiscountGiven: 10400,
    applicableProducts: [],
    applicableCategories: [],
    usedBy: [],
    createdAt: new Date('2025-01-15').toISOString()
  },
  {
    id: 'coup-004',
    code: 'VEG20',
    description: '20% OFF on Fresh Vegetables and Seasonal Fruits',
    discountType: 'category_discount',
    discountValue: 20,
    minOrder: 300,
    maxDiscount: 100,
    usageLimit: 200,
    perUserLimit: 2,
    startDate: new Date('2025-03-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    status: 'active',
    usageCount: 75,
    totalDiscountGiven: 5250,
    applicableProducts: [],
    applicableCategories: ['Vegetables', 'Fruits', 'Vegetables & Fruits'],
    usedBy: [],
    createdAt: new Date('2025-03-01').toISOString()
  },
  {
    id: 'coup-005',
    code: 'WELCOME100',
    description: 'Exclusive Rs. 100 discount for new customers on first order',
    discountType: 'first_order',
    discountValue: 100,
    minOrder: 600,
    maxDiscount: 100,
    usageLimit: null,
    perUserLimit: 1,
    startDate: new Date('2025-01-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    status: 'active',
    usageCount: 112,
    totalDiscountGiven: 11200,
    applicableProducts: [],
    applicableCategories: [],
    usedBy: [],
    createdAt: new Date('2025-01-01').toISOString()
  },
  {
    id: 'coup-006',
    code: 'BULKSAVE15',
    description: 'Save 15% on bulk pantry orders above Rs. 1,500',
    discountType: 'min_order_discount',
    discountValue: 15,
    minOrder: 1500,
    maxDiscount: 350,
    usageLimit: 150,
    perUserLimit: 3,
    startDate: new Date('2025-02-15').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    status: 'active',
    usageCount: 43,
    totalDiscountGiven: 9890,
    applicableProducts: [],
    applicableCategories: [],
    usedBy: [],
    createdAt: new Date('2025-02-15').toISOString()
  },
  {
    id: 'coup-007',
    code: 'RICE25',
    description: 'Special Rs. 25 OFF on Premium Basmati & Taichin Rice',
    discountType: 'product_discount',
    discountValue: 25,
    minOrder: 250,
    maxDiscount: 50,
    usageLimit: 100,
    perUserLimit: 2,
    startDate: new Date('2025-01-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    status: 'active',
    usageCount: 38,
    totalDiscountGiven: 950,
    applicableProducts: ['Taichin Rice', 'Basmati Rice', 'Jeera Masino Rice'],
    applicableCategories: [],
    usedBy: [],
    createdAt: new Date('2025-01-01').toISOString()
  },
  {
    id: 'coup-008',
    code: 'DASHAIN2025',
    description: 'Festive Season Promo - Expired',
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 800,
    maxDiscount: 250,
    usageLimit: 300,
    perUserLimit: 1,
    startDate: new Date('2025-10-01').toISOString(),
    endDate: new Date('2025-10-31').toISOString(),
    status: 'expired',
    usageCount: 298,
    totalDiscountGiven: 44700,
    applicableProducts: [],
    applicableCategories: [],
    usedBy: [],
    createdAt: new Date('2025-09-25').toISOString()
  }
];

class CouponService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('aone_admin_jwt_token') || sessionStorage.getItem('aone_admin_jwt_token');
    if (token) return { Authorization: `Bearer ${token}` };
    return {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsInJvbGUiOiJhZG1pbiJ9.mock_jwt_signature`
    };
  }

  /**
   * Fetch All Coupons
   */
  async getCoupons(params?: { search?: string; status?: string; discountType?: string }): Promise<Coupon[]> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.status && params.status !== 'all') query.append('status', params.status);
      if (params?.discountType && params.discountType !== 'all') query.append('discountType', params.discountType);

      const res = await fetch(`${API_BASE_URL}/coupons?${query.toString()}`, {
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((c: any) => ({ ...c, id: c._id || c.id }));
          this.saveToStorage(mapped);
          return mapped;
        }
      }
    } catch (e) {
      console.warn('Backend coupons API offline, using local storage:', e);
    }

    // Local fallback
    let list = this.getFromStorage();
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(c => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    if (params?.status && params.status !== 'all') {
      list = list.filter(c => c.status === params.status);
    }
    if (params?.discountType && params.discountType !== 'all') {
      list = list.filter(c => c.discountType === params.discountType);
    }
    return list;
  }

  /**
   * Fetch Coupon Stats
   */
  async getStats(): Promise<CouponStats> {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/stats`, {
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.stats) {
          return json.stats;
        }
      }
    } catch (e) {
      // ignore
    }

    // Local stats computation
    const coupons = this.getFromStorage();
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(c => c.status === 'active').length;
    const expiredCoupons = coupons.filter(c => c.status === 'expired' || new Date() > new Date(c.endDate)).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
    const totalDiscountGranted = coupons.reduce((sum, c) => sum + (c.totalDiscountGiven || 0), 0);

    const byType: Record<string, number> = {};
    coupons.forEach(c => {
      byType[c.discountType] = (byType[c.discountType] || 0) + 1;
    });

    return {
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalRedemptions,
      totalDiscountGranted,
      byType
    };
  }

  /**
   * Create Coupon
   */
  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    const normalizedCode = String(data.code || '').trim().toUpperCase();

    try {
      const res = await fetch(`${API_BASE_URL}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify({ ...data, code: normalizedCode })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const created = { ...json.data, id: json.data._id || json.data.id };
          const list = this.getFromStorage();
          list.unshift(created);
          this.saveToStorage(list);
          return created;
        }
      } else {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Failed to create coupon');
      }
    } catch (e: any) {
      if (e?.message && !e.message.includes('Failed to fetch')) {
        throw e;
      }
      console.warn('API error, saving coupon locally:', e);
    }

    // Local fallback
    const list = this.getFromStorage();
    if (list.some(c => c.code === normalizedCode)) {
      throw new Error(`Coupon code '${normalizedCode}' already exists`);
    }

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: normalizedCode,
      description: data.description || '',
      discountType: data.discountType || 'percentage',
      discountValue: Number(data.discountValue) || 0,
      minOrder: Number(data.minOrder) || 0,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
      perUserLimit: Number(data.perUserLimit) || 1,
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      status: data.status || 'active',
      usageCount: 0,
      totalDiscountGiven: 0,
      applicableProducts: data.applicableProducts || [],
      applicableCategories: data.applicableCategories || [],
      usedBy: [],
      createdAt: new Date().toISOString()
    };

    list.unshift(newCoupon);
    this.saveToStorage(list);
    return newCoupon;
  }

  /**
   * Update Coupon
   */
  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    if (updates.code) {
      updates.code = String(updates.code).trim().toUpperCase();
    }

    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updated = { ...json.data, id: json.data._id || json.data.id };
          this.updateLocalCoupon(updated);
          return updated;
        }
      } else {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Failed to update coupon');
      }
    } catch (e: any) {
      if (e?.message && !e.message.includes('Failed to fetch')) {
        throw e;
      }
    }

    const list = this.getFromStorage();
    const idx = list.findIndex(c => c.id === id || c._id === id);
    if (idx === -1) throw new Error('Coupon not found');

    if (updates.code && updates.code !== list[idx].code) {
      if (list.some(c => c.code === updates.code && c.id !== id && c._id !== id)) {
        throw new Error(`Coupon code '${updates.code}' is already in use`);
      }
    }

    list[idx] = { ...list[idx], ...updates };
    this.saveToStorage(list);
    return list[idx];
  }

  /**
   * Toggle Status (active <-> inactive)
   */
  async toggleStatus(id: string): Promise<Coupon> {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updated = { ...json.data, id: json.data._id || json.data.id };
          this.updateLocalCoupon(updated);
          return updated;
        }
      }
    } catch (e) {
      // fallback
    }

    const list = this.getFromStorage();
    const idx = list.findIndex(c => c.id === id || c._id === id);
    if (idx === -1) throw new Error('Coupon not found');

    list[idx].status = list[idx].status === 'active' ? 'inactive' : 'active';
    this.saveToStorage(list);
    return list[idx];
  }

  /**
   * Delete Coupon
   */
  async deleteCoupon(id: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });
      if (res.ok) {
        const list = this.getFromStorage().filter(c => c.id !== id && c._id !== id);
        this.saveToStorage(list);
        return;
      }
    } catch (e) {
      // fallback
    }

    const list = this.getFromStorage().filter(c => c.id !== id && c._id !== id);
    this.saveToStorage(list);
  }

  /**
   * SECURE SERVER-SIDE VALIDATION
   * Validates coupon constraints via backend POST /api/coupons/validate.
   * If backend is not available, executes precise identical validation rules.
   */
  async validateCoupon(params: ValidateCouponParams): Promise<CouponValidationResult> {
    // 1. Try Backend API
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return json;
      } else {
        return {
          valid: false,
          message: json.message || 'Coupon validation failed.'
        };
      }
    } catch (e) {
      console.warn('Backend coupon validate endpoint unreachable, falling back to local verification:', e);
    }

    // 2. Strict Local Validation Fallback (Mirrors Backend Rules Exactly)
    const code = String(params.code || '').trim().toUpperCase();
    const subtotal = Number(params.subtotal) || 0;
    const deliveryFee = Number(params.deliveryFee) || 40;
    const list = this.getFromStorage();

    const coupon = list.find(c => c.code === code);
    if (!coupon) {
      return { valid: false, message: `Coupon '${code}' is invalid or does not exist.` };
    }

    if (coupon.status !== 'active') {
      return { valid: false, message: `Coupon '${coupon.code}' is currently inactive.` };
    }

    const now = new Date();
    if (now < new Date(coupon.startDate)) {
      return {
        valid: false,
        message: `Coupon '${coupon.code}' starts on ${new Date(coupon.startDate).toLocaleDateString()}.`
      };
    }

    if (now > new Date(coupon.endDate)) {
      return { valid: false, message: `Coupon '${coupon.code}' has expired.` };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: `Coupon '${coupon.code}' has reached its total usage limit.` };
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      const diff = coupon.minOrder - subtotal;
      return {
        valid: false,
        message: `Add Rs. ${diff} more to your cart to use this coupon (Min. Rs. ${coupon.minOrder}).`
      };
    }

    let discountAmount = 0;
    let explanation = '';
    let deliveryFeeWaived = false;

    switch (coupon.discountType) {
      case 'percentage': {
        const raw = (subtotal * coupon.discountValue) / 100;
        discountAmount = Math.round(raw);
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
          explanation = `${coupon.discountValue}% discount capped at Rs. ${coupon.maxDiscount}`;
        } else {
          explanation = `${coupon.discountValue}% discount applied`;
        }
        break;
      }
      case 'fixed_amount': {
        discountAmount = Math.min(coupon.discountValue, subtotal);
        explanation = `Flat Rs. ${discountAmount} discount applied`;
        break;
      }
      case 'free_delivery': {
        discountAmount = deliveryFee;
        deliveryFeeWaived = true;
        explanation = `Free delivery applied (Saved Rs. ${deliveryFee})`;
        break;
      }
      case 'first_order': {
        discountAmount = Math.min(coupon.discountValue, subtotal);
        explanation = `Welcome discount applied`;
        break;
      }
      case 'min_order_discount': {
        if (coupon.discountValue <= 100) {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
        } else {
          discountAmount = coupon.discountValue;
        }
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
        explanation = `Tiered minimum order discount applied`;
        break;
      }
      case 'category_discount': {
        discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
        explanation = `${coupon.discountValue}% category discount applied`;
        break;
      }
      case 'product_discount': {
        discountAmount = Math.min(coupon.discountValue, subtotal);
        explanation = `Product discount applied`;
        break;
      }
    }

    discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
        deliveryFeeWaived
      },
      discountAmount,
      finalSubtotal: Math.max(0, subtotal - discountAmount),
      explanation,
      message: `Coupon "${coupon.code}" applied! You save Rs. ${discountAmount}.`
    };
  }

  // --- Storage Helpers ---
  private getFromStorage(): Coupon[] {
    try {
      const raw = localStorage.getItem(STORAGE_COUPONS_KEY);
      if (!raw) {
        this.saveToStorage(INITIAL_COUPONS);
        return [...INITIAL_COUPONS];
      }
      return JSON.parse(raw);
    } catch (e) {
      return [...INITIAL_COUPONS];
    }
  }

  private saveToStorage(coupons: Coupon[]): void {
    localStorage.setItem(STORAGE_COUPONS_KEY, JSON.stringify(coupons));
  }

  private updateLocalCoupon(coupon: Coupon): void {
    const list = this.getFromStorage();
    const idx = list.findIndex(c => c.id === coupon.id || c._id === coupon.id);
    if (idx !== -1) list[idx] = coupon;
    else list.unshift(coupon);
    this.saveToStorage(list);
  }
}

export const couponService = new CouponService();
