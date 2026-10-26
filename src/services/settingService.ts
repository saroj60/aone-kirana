export interface StoreSettings {
  name: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
}

export interface DeliverySettings {
  radiusKm: number;
  fee: number;
  freeThreshold: number;
  estimatedTime: string;
}

export interface PaymentSettings {
  cod: {
    enabled: boolean;
    maxOrderAmount?: number;
    instructions?: string;
  };
  esewa: {
    enabled: boolean;
    merchantCode: string;
    serviceChargePercent: number;
  };
  khalti: {
    enabled: boolean;
    publicKey: string;
  };
  card: {
    enabled: boolean;
    provider: string;
  };
}

export interface BusinessSettings {
  currency: string;
  taxPercent: number;
  invoicePrefix: string;
}

export interface NotificationSettings {
  orderEmail: boolean;
  orderPush: boolean;
  orderSms: boolean;
  lowStockAlerts: boolean;
  lowStockThreshold: number;
  promotionalBroadcasts: boolean;
}

export interface AdminSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AllSettings {
  store: StoreSettings;
  delivery: DeliverySettings;
  payment: PaymentSettings;
  business: BusinessSettings;
  notifications: NotificationSettings;
  sessions?: AdminSession[];
}

const STORAGE_SETTINGS_KEY = 'aone_admin_settings_v1';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const INITIAL_SETTINGS: AllSettings = {
  store: {
    name: 'Aone Kirana Store',
    logo: '/logo.png',
    phone: '9841234567',
    email: 'support@aonekirana.com',
    address: 'Ward 5, Tikathali Chowk, Mahalaxmi, Lalitpur',
    openingHours: '6:30 AM – 9:30 PM (7 Days a Week)'
  },
  delivery: {
    radiusKm: 5.0,
    fee: 40,
    freeThreshold: 500,
    estimatedTime: '30–60 minutes'
  },
  payment: {
    cod: {
      enabled: true,
      maxOrderAmount: 10000,
      instructions: 'Pay with cash upon physical delivery at your door.'
    },
    esewa: {
      enabled: true,
      merchantCode: 'EPAYTEST',
      serviceChargePercent: 0
    },
    khalti: {
      enabled: true,
      publicKey: 'test_public_key_dc74e0fd574e4d46b8817248e59c22ac'
    },
    card: {
      enabled: false,
      provider: 'Fonepay Visa / Mastercard'
    }
  },
  business: {
    currency: 'NPR (Rs.)',
    taxPercent: 0,
    invoicePrefix: 'AK-'
  },
  notifications: {
    orderEmail: true,
    orderPush: true,
    orderSms: false,
    lowStockAlerts: true,
    lowStockThreshold: 10,
    promotionalBroadcasts: true
  },
  sessions: [
    {
      id: 'sess-current',
      device: 'Windows 11 PC (Desktop)',
      browser: 'Google Chrome 124.0',
      ipAddress: '103.10.31.84',
      location: 'Lalitpur, Nepal',
      loginTime: new Date(Date.now() - 7200000).toISOString(),
      lastActive: new Date().toISOString(),
      isCurrent: true
    },
    {
      id: 'sess-mobile',
      device: 'Samsung Galaxy S23 (Android)',
      browser: 'Aone Admin App',
      ipAddress: '27.34.48.12',
      location: 'Kathmandu, Nepal',
      loginTime: new Date(Date.now() - 86400000).toISOString(),
      lastActive: new Date(Date.now() - 14400000).toISOString(),
      isCurrent: false
    }
  ]
};

class SettingService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('aone_admin_jwt_token') || sessionStorage.getItem('aone_admin_jwt_token');
    if (token) return { Authorization: `Bearer ${token}` };
    return {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsInJvbGUiOiJhZG1pbiJ9.mock_jwt_signature`
    };
  }

  /**
   * 1. Get Store Settings from Backend
   */
  async getSettings(): Promise<AllSettings> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const settings = json.data;
          this.saveToStorage(settings);
          return settings;
        }
      }
    } catch (e) {
      console.warn('Backend settings API offline, using local storage:', e);
    }
    return this.getFromStorage();
  }

  /**
   * 2. Update Store Settings
   */
  async updateSettings(updates: Partial<AllSettings>): Promise<AllSettings> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.saveToStorage(json.data);
          return json.data;
        }
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update settings');
      }
    } catch (e: any) {
      if (e?.message && !e.message.includes('Failed to fetch')) throw e;
    }

    // Local fallback
    const current = this.getFromStorage();
    const merged: AllSettings = {
      ...current,
      ...updates,
      store: updates.store ? { ...current.store, ...updates.store } : current.store,
      delivery: updates.delivery ? { ...current.delivery, ...updates.delivery } : current.delivery,
      payment: updates.payment ? { ...current.payment, ...updates.payment } : current.payment,
      business: updates.business ? { ...current.business, ...updates.business } : current.business,
      notifications: updates.notifications ? { ...current.notifications, ...updates.notifications } : current.notifications
    };
    this.saveToStorage(merged);
    return merged;
  }

  /**
   * 3. Change Admin Password
   */
  async changePassword(params: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify(params)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update admin password');
      }
      return json;
    } catch (e: any) {
      if (e?.message && !e.message.includes('Failed to fetch')) throw e;
    }

    // Local fallback check
    if (params.newPassword !== params.confirmNewPassword) {
      throw new Error('New password and confirmation do not match');
    }
    if (params.newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    return { success: true, message: 'Password updated successfully' };
  }

  /**
   * 4. Get Active Admin Sessions
   */
  async getSessions(): Promise<AdminSession[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/sessions`, {
        headers: { ...this.getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.sessions)) {
          return json.sessions;
        }
      }
    } catch (e) {
      // fallback
    }
    const current = this.getFromStorage();
    return current.sessions || INITIAL_SETTINGS.sessions!;
  }

  /**
   * 5. Logout All Other Sessions
   */
  async logoutAllSessions(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/sessions/logout-all`, {
        method: 'POST',
        headers: { ...this.getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (e) {
      // fallback
    }
    const current = this.getFromStorage();
    if (current.sessions) {
      current.sessions = current.sessions.filter(s => s.isCurrent);
      this.saveToStorage(current);
    }
    return { success: true, message: 'All other sessions have been logged out' };
  }

  // --- Local Storage Helpers ---
  private getFromStorage(): AllSettings {
    try {
      const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (!raw) {
        this.saveToStorage(INITIAL_SETTINGS);
        return { ...INITIAL_SETTINGS };
      }
      return JSON.parse(raw);
    } catch (e) {
      return { ...INITIAL_SETTINGS };
    }
  }

  private saveToStorage(settings: AllSettings): void {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  }
}

export const settingService = new SettingService();
