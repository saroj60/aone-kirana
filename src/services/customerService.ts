export interface CustomerAddress {
  label: string;
  address: string;
  landmark?: string;
  isDefault: boolean;
}

export interface CustomerReview {
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CustomerActivity {
  action: string;
  details: string;
  timestamp: string;
}

export interface AdminCustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  addresses: CustomerAddress[];
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'Active' | 'Disabled' | 'Inactive' | 'Suspended';
  createdAt: string;
  reviews: CustomerReview[];
  activityLog: CustomerActivity[];
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  disabledCustomers: number;
  totalCustomerSpend: number;
  averageCustomerValue: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import { getApiBaseUrl } from '../config/api';

const CUSTOMERS_STORAGE_KEY = 'aone_admin_customers_v2';
const API_BASE_URL = getApiBaseUrl();

// Purge old hardcoded customer storage from previous versions
try {
  localStorage.removeItem('aone_admin_customers_v1');
} catch {
  // ignore
}

// Initial empty customers list - real registered customers only
export const INITIAL_CUSTOMERS: AdminCustomerDetail[] = [];

class CustomerService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('aone_admin_jwt_token') || sessionStorage.getItem('aone_admin_jwt_token');
    if (token) return { Authorization: `Bearer ${token}` };
    return {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsInJvbGUiOiJhZG1pbiJ9.mock_jwt_signature`
    };
  }

  /**
   * Get all real customers with search, status filter, and pagination
   */
  async getCustomers(options?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ customers: AdminCustomerDetail[]; stats: CustomerStats; pagination: PaginationInfo }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;

    // 1. Try Backend API (MongoDB)
    try {
      const q = new URLSearchParams();
      if (options?.search) q.set('search', options.search);
      if (options?.status && options.status !== 'all') q.set('status', options.status);
      q.set('page', page.toString());
      q.set('limit', limit.toString());

      const res = await fetch(`${API_BASE_URL}/customers?${q.toString()}`, {
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.saveCustomers(json.data);
          return {
            customers: json.data,
            stats: json.stats || {
              totalCustomers: json.data.length,
              activeCustomers: json.data.filter((c: any) => c.status === 'Active').length,
              disabledCustomers: json.data.filter((c: any) => c.status === 'Disabled').length,
              totalCustomerSpend: json.data.reduce((s: number, c: any) => s + (c.totalSpent || 0), 0),
              averageCustomerValue: 0
            },
            pagination: json.pagination || {
              total: json.data.length,
              page,
              limit,
              totalPages: Math.max(1, Math.ceil(json.data.length / limit))
            }
          };
        }
      }
    } catch (e) {
      console.warn('Backend customers API offline, utilizing local storage:', e);
    }

    // 2. Local Fallback (only if server is unreachable)
    const all = this.getCustomersFromStorage();
    let filtered = [...all];

    if (options?.status && options.status !== 'all') {
      filtered = filtered.filter(c => c.status.toLowerCase() === options.status?.toLowerCase());
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    const totalSpend = all.reduce((acc, c) => acc + (c.totalSpent || 0), 0);

    const stats: CustomerStats = {
      totalCustomers: all.length,
      activeCustomers: all.filter(c => c.status === 'Active').length,
      disabledCustomers: all.filter(c => c.status === 'Disabled').length,
      totalCustomerSpend: totalSpend,
      averageCustomerValue: all.length > 0 ? Math.round(totalSpend / all.length) : 0
    };

    const pagination: PaginationInfo = {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit))
    };

    return { customers: paginated, stats, pagination };
  }

  /**
   * Toggle Customer Account Status (Active <-> Disabled)
   */
  async toggleStatus(customerId: string, status?: 'Active' | 'Disabled'): Promise<AdminCustomerDetail> {
    const list = this.getCustomersFromStorage();
    const cust = list.find(c => c.id === customerId);

    const targetStatus = status || (cust?.status === 'Active' ? 'Disabled' : 'Active');

    // Try API
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${customerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify({ status: targetStatus })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.updateLocalCustomer(json.data);
          return json.data;
        }
      }
    } catch (e) {
      console.warn('API error, handling toggle locally:', e);
    }

    if (!cust) throw new Error('Customer not found');

    cust.status = targetStatus;
    if (!cust.activityLog) cust.activityLog = [];
    cust.activityLog.unshift({
      action: `Account ${targetStatus}`,
      details: `Account status updated to ${targetStatus} by admin`,
      timestamp: new Date().toISOString()
    });

    this.updateLocalCustomer(cust);
    return cust;
  }

  resetToDefaults(): AdminCustomerDetail[] {
    localStorage.removeItem(CUSTOMERS_STORAGE_KEY);
    return [];
  }

  private getCustomersFromStorage(): AdminCustomerDetail[] {
    try {
      const raw = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  private saveCustomers(customers: AdminCustomerDetail[]) {
    try {
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to save customers to storage', e);
    }
  }

  private updateLocalCustomer(updated: AdminCustomerDetail) {
    const list = this.getCustomersFromStorage();
    const idx = list.findIndex(c => c.id === updated.id);
    if (idx !== -1) {
      list[idx] = updated;
    } else {
      list.unshift(updated);
    }
    this.saveCustomers(list);
  }

  /**
   * Save a newly registered or active customer to database and admin view
   */
  async saveRegisteredCustomer(user: {
    id?: string;
    name?: string;
    fullName?: string;
    phone: string;
    address?: string;
    landmark?: string;
    email?: string;
    status?: 'Active' | 'Disabled';
  }): Promise<{ success: boolean; data?: AdminCustomerDetail; error?: string }> {
    const userName = (user.fullName || user.name || '').trim() || 'Registered Customer';
    const userPhone = user.phone.trim();
    const userAddress = (user.address || '').trim() || 'Ward 5, Tikathali Chowk, Lalitpur';
    const userLandmark = (user.landmark || '').trim();
    const userEmail = (user.email || '').trim() || `${userPhone}@aonekirana.np`;
    const userStatus = user.status || 'Active';

    let savedData: AdminCustomerDetail | null = null;

    // 1. Sync to backend MongoDB
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          phone: userPhone,
          address: userAddress,
          landmark: userLandmark,
          email: userEmail,
          status: userStatus
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          savedData = json.data;
        }
      }
    } catch (e) {
      console.warn('Backend sync failed, storing locally:', e);
    }

    // 2. Cache in local storage
    try {
      const list = this.getCustomersFromStorage();
      const existingIndex = list.findIndex(c => c.phone === userPhone || (user.id && c.id === user.id));
      const targetCustomer: AdminCustomerDetail = savedData || {
        id: user.id || `cust-${Date.now().toString().slice(-6)}`,
        name: userName,
        email: userEmail,
        phone: userPhone,
        address: userAddress,
        addresses: [
          {
            label: 'Home',
            address: userAddress,
            landmark: userLandmark,
            isDefault: true
          }
        ],
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: new Date().toISOString(),
        status: userStatus,
        createdAt: new Date().toISOString(),
        reviews: [],
        activityLog: [
          {
            action: 'Registered',
            details: 'Customer registered via Admin Console',
            timestamp: new Date().toISOString()
          }
        ]
      };

      if (existingIndex >= 0) {
        list[existingIndex] = {
          ...list[existingIndex],
          ...targetCustomer
        };
      } else {
        list.unshift(targetCustomer);
      }
      this.saveCustomers(list);
      return { success: true, data: targetCustomer };
    } catch (e: any) {
      console.warn('Failed to save customer to admin storage:', e);
      return { success: false, error: e?.message || 'Failed to register customer' };
    }
  }
}

export const customerService = new CustomerService();
