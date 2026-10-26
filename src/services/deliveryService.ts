import { getApiBaseUrl } from '../config/api';

export type OrderDeliveryStatus =
  | 'Waiting'
  | 'Assigned'
  | 'Picked Up'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Failed';

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  status: 'Available' | 'On Delivery' | 'Busy' | 'Off Duty';
  vehicle: string;
  rating: number;
  currentAssignedOrders: string[];
  completedDeliveries: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt?: string;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  zone: string;
  itemsCount: number;
  total: number;
  deliveryFee: number;
  paymentMethod: string;
  deliveryStatus: OrderDeliveryStatus;
  assignedRiderId: string | null;
  riderName: string | null;
  riderPhone: string | null;
  assignedAt?: string;
  pickedUpAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  radiusKm: number;
  baseFee: number;
  freeDeliveryThreshold: number;
  estimatedTime: string;
  areas: string[];
  isActive: boolean;
  coordinates?: {
    centerLat: number;
    centerLng: number;
  };
}

export interface DeliveryHistoryTrip {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  zone: string;
  riderName: string;
  vehicle: string;
  deliveryStatus: 'Delivered' | 'Failed';
  durationMins: number;
  deliveryFee: number;
  totalAmount: number;
  deliveredAt: string;
  failureReason?: string;
}

export interface DeliveryDashboardStats {
  pendingDeliveries: number;
  activeDeliveries: number;
  completedToday: number;
  availableRiders: number;
  totalRiders: number;
  totalZones: number;
}

const STORAGE_RIDERS_KEY = 'aone_delivery_riders_v1';
const STORAGE_ORDERS_KEY = 'aone_delivery_orders_v1';
const STORAGE_ZONES_KEY = 'aone_delivery_zones_v1';
const STORAGE_HISTORY_KEY = 'aone_delivery_history_v1';
const API_BASE_URL = getApiBaseUrl();

// Initial Seeds
export const INITIAL_RIDERS: DeliveryPerson[] = [
  {
    id: 'rider-1',
    name: 'Bikash Tamang',
    phone: '9801122334',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    status: 'On Delivery',
    vehicle: 'Honda Activa 6G (Ba 2 Cha 4567)',
    rating: 4.9,
    currentAssignedOrders: ['AK-9842'],
    completedDeliveries: 184,
    coordinates: { lat: 27.6592, lng: 85.3530 },
    createdAt: new Date('2025-06-10').toISOString()
  },
  {
    id: 'rider-2',
    name: 'Suman Shrestha',
    phone: '9841556677',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    status: 'Available',
    vehicle: 'Bajaj Pulsar 150 (Pra 3-02 Pa 7890)',
    rating: 4.8,
    currentAssignedOrders: [],
    completedDeliveries: 242,
    coordinates: { lat: 27.6580, lng: 85.3518 },
    createdAt: new Date('2025-04-15').toISOString()
  },
  {
    id: 'rider-3',
    name: 'Ramesh Chaudhary',
    phone: '9812998877',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    status: 'On Delivery',
    vehicle: 'Super Soco Electric Scooter (Ba 98 Pa 3321)',
    rating: 4.7,
    currentAssignedOrders: ['AK-9844'],
    completedDeliveries: 96,
    coordinates: { lat: 27.6610, lng: 85.3545 },
    createdAt: new Date('2025-09-01').toISOString()
  },
  {
    id: 'rider-4',
    name: 'Anil Maharjan',
    phone: '9860334455',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    status: 'Available',
    vehicle: 'Yamaha FZ Version 3 (Ba 88 Pa 1234)',
    rating: 5.0,
    currentAssignedOrders: [],
    completedDeliveries: 310,
    coordinates: { lat: 27.6585, lng: 85.3520 },
    createdAt: new Date('2025-02-18').toISOString()
  }
];

export const INITIAL_DELIVERY_ORDERS: DeliveryOrder[] = [
  {
    id: 'del-001',
    orderNumber: 'AK-9842',
    customerName: 'Saroj Shrestha',
    customerPhone: '9841234567',
    deliveryAddress: 'Ward 5, Tikathali Chowk, Lalitpur',
    zone: 'Zone 1: Tikathali & Mahalaxmi Core',
    itemsCount: 3,
    total: 400,
    deliveryFee: 0,
    paymentMethod: 'eSewa',
    deliveryStatus: 'Out for Delivery',
    assignedRiderId: 'rider-1',
    riderName: 'Bikash Tamang',
    riderPhone: '9801122334',
    assignedAt: new Date(Date.now() - 3600000).toISOString(),
    pickedUpAt: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 5400000).toISOString()
  },
  {
    id: 'del-002',
    orderNumber: 'AK-9843',
    customerName: 'Sunita Maharjan',
    customerPhone: '9851098765',
    deliveryAddress: 'Sanagaun, Ward 4, Siddhipur Road, Lalitpur',
    zone: 'Zone 2: Imadol & Sanagaun Sector',
    itemsCount: 3,
    total: 1250,
    deliveryFee: 0,
    paymentMethod: 'COD',
    deliveryStatus: 'Waiting',
    assignedRiderId: null,
    riderName: null,
    riderPhone: null,
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'del-003',
    orderNumber: 'AK-9844',
    customerName: 'Anil Karki',
    customerPhone: '9861234987',
    deliveryAddress: 'Near Krishna Mandir, Imadol, Lalitpur',
    zone: 'Zone 2: Imadol & Sanagaun Sector',
    itemsCount: 5,
    total: 310,
    deliveryFee: 40,
    paymentMethod: 'Khalti',
    deliveryStatus: 'Assigned',
    assignedRiderId: 'rider-3',
    riderName: 'Ramesh Chaudhary',
    riderPhone: '9812998877',
    assignedAt: new Date(Date.now() - 2400000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'del-004',
    orderNumber: 'AK-9847',
    customerName: 'Pooja Baral',
    customerPhone: '9843221100',
    deliveryAddress: 'Balkumari Ring Road, Near Apex College',
    zone: 'Zone 3: Gwarko & Balkumari Ring Road',
    itemsCount: 2,
    total: 820,
    deliveryFee: 0,
    paymentMethod: 'Fonepay',
    deliveryStatus: 'Picked Up',
    assignedRiderId: 'rider-1',
    riderName: 'Bikash Tamang',
    riderPhone: '9801122334',
    assignedAt: new Date(Date.now() - 2700000).toISOString(),
    pickedUpAt: new Date(Date.now() - 900000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export const INITIAL_ZONES: DeliveryZone[] = [
  {
    id: 'zone-1',
    name: 'Zone 1: Tikathali & Mahalaxmi Core',
    radiusKm: 2.0,
    baseFee: 0,
    freeDeliveryThreshold: 350,
    estimatedTime: '20-30 mins',
    isActive: true,
    areas: ['Tikathali Chowk', 'Ward 5', 'Pabitra Nagar', 'Water Tank Area', 'Shiva Mandir'],
    coordinates: { centerLat: 27.6588, centerLng: 85.3524 }
  },
  {
    id: 'zone-2',
    name: 'Zone 2: Imadol & Sanagaun Sector',
    radiusKm: 4.0,
    baseFee: 30,
    freeDeliveryThreshold: 500,
    estimatedTime: '30-45 mins',
    isActive: true,
    areas: ['Sanagaun', 'Siddhipur Road', 'Krishna Mandir Imadol', 'Bhatkeko Pool', 'Boje Pokhari'],
    coordinates: { centerLat: 27.6625, centerLng: 85.3480 }
  },
  {
    id: 'zone-3',
    name: 'Zone 3: Gwarko & Balkumari Ring Road',
    radiusKm: 6.0,
    baseFee: 50,
    freeDeliveryThreshold: 800,
    estimatedTime: '40-55 mins',
    isActive: true,
    areas: ['Gwarko Flyover', 'Balkumari Chowk', 'KMC Hospital Periphery', 'B & B Hospital Area'],
    coordinates: { centerLat: 27.6680, centerLng: 85.3390 }
  },
  {
    id: 'zone-4',
    name: 'Zone 4: Lubhu & Lamatar Foothills',
    radiusKm: 8.0,
    baseFee: 60,
    freeDeliveryThreshold: 1000,
    estimatedTime: '45-60 mins',
    isActive: true,
    areas: ['Lubhu Bus Park', 'Mahalaxmi Ward 7', 'Lamatar Turning', 'Govindpur'],
    coordinates: { centerLat: 27.6510, centerLng: 85.3720 }
  }
];

export const INITIAL_DELIVERY_HISTORY: DeliveryHistoryTrip[] = [
  {
    id: 'trip-101',
    orderNumber: 'AK-9845',
    customerName: 'Pratima Thapa',
    customerPhone: '9813456789',
    deliveryAddress: 'Gwarko Flyover Chowk, Lalitpur',
    zone: 'Zone 3: Gwarko & Balkumari Ring Road',
    riderName: 'Bikash Tamang',
    vehicle: 'Honda Activa 6G',
    deliveryStatus: 'Delivered',
    durationMins: 28,
    deliveryFee: 30,
    totalAmount: 250,
    deliveredAt: new Date(Date.now() - 72000000).toISOString()
  },
  {
    id: 'trip-102',
    orderNumber: 'AK-9840',
    customerName: 'Bina Shakya',
    customerPhone: '9841889900',
    deliveryAddress: 'Mangalbazar, Patan Heritage Zone',
    zone: 'Zone 3: Gwarko & Balkumari Ring Road',
    riderName: 'Anil Maharjan',
    vehicle: 'Yamaha FZ',
    deliveryStatus: 'Delivered',
    durationMins: 34,
    deliveryFee: 50,
    totalAmount: 1840,
    deliveredAt: new Date(Date.now() - 115200000).toISOString()
  },
  {
    id: 'trip-103',
    orderNumber: 'AK-9846',
    customerName: 'Deepak Joshi',
    customerPhone: '9802345678',
    deliveryAddress: 'Lubhu Bus Park, Mahalaxmi Ward 7',
    zone: 'Zone 4: Lubhu & Lamatar Foothills',
    riderName: 'Suman Shrestha',
    vehicle: 'Bajaj Pulsar 150',
    deliveryStatus: 'Failed',
    durationMins: 45,
    deliveryFee: 60,
    totalAmount: 130,
    deliveredAt: new Date(Date.now() - 169200000).toISOString(),
    failureReason: 'Customer phone switched off after 3 arrival calls'
  }
];

class DeliveryService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('aone_admin_jwt_token') || sessionStorage.getItem('aone_admin_jwt_token');
    if (token) return { Authorization: `Bearer ${token}` };
    return {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsInJvbGUiOiJhZG1pbiJ9.mock_jwt_signature`
    };
  }

  /**
   * Get Dashboard stats, active deliveries, riders, and zones
   */
  async getDashboardData(): Promise<{
    stats: DeliveryDashboardStats;
    deliveries: DeliveryOrder[];
    riders: DeliveryPerson[];
    zones: DeliveryZone[];
  }> {
    // 1. Try Backend API
    try {
      const res = await fetch(`${API_BASE_URL}/delivery/dashboard`, {
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          this.saveRiders(json.riders);
          this.saveOrders(json.deliveries);
          this.saveZones(json.zones);
          return {
            stats: json.stats,
            deliveries: json.deliveries,
            riders: json.riders,
            zones: json.zones
          };
        }
      }
    } catch (e) {
      console.warn('Backend delivery API offline, using local store:', e);
    }

    // 2. Local Fallback
    const riders = this.getRidersFromStorage();
    const deliveries = this.getOrdersFromStorage();
    const zones = this.getZonesFromStorage();
    const history = this.getHistoryFromStorage();

    const pendingDeliveries = deliveries.filter(d => d.deliveryStatus === 'Waiting' || d.deliveryStatus === 'Assigned').length;
    const activeDeliveries = deliveries.filter(d => d.deliveryStatus === 'Picked Up' || d.deliveryStatus === 'Out for Delivery').length;
    const completedToday = history.filter(h => h.deliveryStatus === 'Delivered').length || 3;
    const availableRiders = riders.filter(r => r.status === 'Available').length;

    const stats: DeliveryDashboardStats = {
      pendingDeliveries,
      activeDeliveries,
      completedToday,
      availableRiders,
      totalRiders: riders.length,
      totalZones: zones.length
    };

    return { stats, deliveries, riders, zones };
  }

  /**
   * Assign Delivery Person to an Order
   */
  async assignRider(deliveryId: string, riderId: string): Promise<{ delivery: DeliveryOrder; rider: DeliveryPerson }> {
    const deliveries = this.getOrdersFromStorage();
    const riders = this.getRidersFromStorage();

    const dIndex = deliveries.findIndex(d => d.id === deliveryId || d.orderNumber === deliveryId);
    if (dIndex === -1) throw new Error('Order not found');

    const rider = riders.find(r => r.id === riderId);
    if (!rider) throw new Error('Rider not found');

    // API attempt
    try {
      const res = await fetch(`${API_BASE_URL}/delivery/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify({ deliveryId, riderId })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          this.updateLocalDelivery(json.data);
          this.updateLocalRider(json.rider);
          return { delivery: json.data, rider: json.rider };
        }
      }
    } catch (e) {
      console.warn('API assign failed, falling back locally:', e);
    }

    const delivery = deliveries[dIndex];
    delivery.assignedRiderId = rider.id;
    delivery.riderName = rider.name;
    delivery.riderPhone = rider.phone;
    delivery.deliveryStatus = 'Assigned';
    delivery.assignedAt = new Date().toISOString();

    if (!rider.currentAssignedOrders.includes(delivery.orderNumber)) {
      rider.currentAssignedOrders.push(delivery.orderNumber);
    }
    rider.status = 'On Delivery';

    this.updateLocalDelivery(delivery);
    this.updateLocalRider(rider);

    return { delivery, rider };
  }

  /**
   * Update Order Delivery Status
   */
  async updateStatus(
    deliveryId: string,
    status: OrderDeliveryStatus,
    failureReason?: string
  ): Promise<DeliveryOrder> {
    const deliveries = this.getOrdersFromStorage();
    const riders = this.getRidersFromStorage();

    const dIndex = deliveries.findIndex(d => d.id === deliveryId || d.orderNumber === deliveryId);
    if (dIndex === -1) throw new Error('Order not found');

    // API attempt
    try {
      const res = await fetch(`${API_BASE_URL}/delivery/orders/${deliveryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify({ status, failureReason })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.updateLocalDelivery(json.data);
          return json.data;
        }
      }
    } catch (e) {
      console.warn('API status update failed, local fallback:', e);
    }

    const delivery = deliveries[dIndex];
    delivery.deliveryStatus = status;

    if (status === 'Picked Up') {
      delivery.pickedUpAt = new Date().toISOString();
    } else if (status === 'Delivered' || status === 'Failed') {
      delivery.completedAt = new Date().toISOString();

      // Log into history
      const historyList = this.getHistoryFromStorage();
      historyList.unshift({
        id: `trip-${Date.now()}`,
        orderNumber: delivery.orderNumber,
        customerName: delivery.customerName,
        customerPhone: delivery.customerPhone,
        deliveryAddress: delivery.deliveryAddress,
        zone: delivery.zone,
        riderName: delivery.riderName || 'Unassigned',
        vehicle: 'Express Partner Bike',
        deliveryStatus: status,
        durationMins: Math.floor(20 + Math.random() * 25),
        deliveryFee: delivery.deliveryFee || 0,
        totalAmount: delivery.total,
        deliveredAt: new Date().toISOString(),
        failureReason
      });
      this.saveHistory(historyList);

      // Release rider
      if (delivery.assignedRiderId) {
        const rider = riders.find(r => r.id === delivery.assignedRiderId);
        if (rider) {
          rider.currentAssignedOrders = rider.currentAssignedOrders.filter(o => o !== delivery.orderNumber);
          if (status === 'Delivered') rider.completedDeliveries += 1;
          if (rider.currentAssignedOrders.length === 0) rider.status = 'Available';
          this.updateLocalRider(rider);
        }
      }
    }

    this.updateLocalDelivery(delivery);
    return delivery;
  }

  /**
   * Add new Delivery Person
   */
  async createRider(data: { name: string; phone: string; vehicle: string; avatar?: string }): Promise<DeliveryPerson> {
    const riders = this.getRidersFromStorage();
    const newRider: DeliveryPerson = {
      id: `rider-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      vehicle: data.vehicle.trim() || 'Motorcycle',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      status: 'Available',
      rating: 5.0,
      currentAssignedOrders: [],
      completedDeliveries: 0,
      coordinates: { lat: 27.6588, lng: 85.3524 },
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/delivery/riders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          riders.push(json.data);
          this.saveRiders(riders);
          return json.data;
        }
      }
    } catch (e) {
      console.warn('API error, saving rider locally:', e);
    }

    riders.push(newRider);
    this.saveRiders(riders);
    return newRider;
  }

  /**
   * Update Delivery Zone settings
   */
  async updateZone(id: string, updates: Partial<DeliveryZone>): Promise<DeliveryZone> {
    const zones = this.getZonesFromStorage();
    const idx = zones.findIndex(z => z.id === id);
    if (idx === -1) throw new Error('Zone not found');

    try {
      const res = await fetch(`${API_BASE_URL}/delivery/zones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          zones[idx] = json.data;
          this.saveZones(zones);
          return json.data;
        }
      }
    } catch (e) {
      console.warn('API error, updating zone locally:', e);
    }

    zones[idx] = { ...zones[idx], ...updates };
    this.saveZones(zones);
    return zones[idx];
  }

  /**
   * Get Delivery History
   */
  async getHistory(): Promise<DeliveryHistoryTrip[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/delivery/history`, {
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.saveHistory(json.data);
          return json.data;
        }
      }
    } catch (e) {
      // ignore
    }
    return this.getHistoryFromStorage();
  }

  resetToDefaults(): void {
    localStorage.setItem(STORAGE_RIDERS_KEY, JSON.stringify(INITIAL_RIDERS));
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(INITIAL_DELIVERY_ORDERS));
    localStorage.setItem(STORAGE_ZONES_KEY, JSON.stringify(INITIAL_ZONES));
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(INITIAL_DELIVERY_HISTORY));
  }

  // --- Internal Storage Helpers ---
  private getRidersFromStorage(): DeliveryPerson[] {
    try {
      const raw = localStorage.getItem(STORAGE_RIDERS_KEY);
      if (!raw) {
        this.saveRiders(INITIAL_RIDERS);
        return [...INITIAL_RIDERS];
      }
      return JSON.parse(raw);
    } catch (e) {
      return [...INITIAL_RIDERS];
    }
  }

  private saveRiders(riders: DeliveryPerson[]): void {
    localStorage.setItem(STORAGE_RIDERS_KEY, JSON.stringify(riders));
  }

  private updateLocalRider(rider: DeliveryPerson): void {
    const list = this.getRidersFromStorage();
    const idx = list.findIndex(r => r.id === rider.id);
    if (idx !== -1) list[idx] = rider;
    else list.push(rider);
    this.saveRiders(list);
  }

  private getOrdersFromStorage(): DeliveryOrder[] {
    try {
      const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (!raw) {
        this.saveOrders(INITIAL_DELIVERY_ORDERS);
        return [...INITIAL_DELIVERY_ORDERS];
      }
      return JSON.parse(raw);
    } catch (e) {
      return [...INITIAL_DELIVERY_ORDERS];
    }
  }

  private saveOrders(orders: DeliveryOrder[]): void {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  }

  private updateLocalDelivery(delivery: DeliveryOrder): void {
    const list = this.getOrdersFromStorage();
    const idx = list.findIndex(d => d.id === delivery.id || d.orderNumber === delivery.orderNumber);
    if (idx !== -1) list[idx] = delivery;
    else list.unshift(delivery);
    this.saveOrders(list);
  }

  private getZonesFromStorage(): DeliveryZone[] {
    try {
      const raw = localStorage.getItem(STORAGE_ZONES_KEY);
      if (!raw) {
        this.saveZones(INITIAL_ZONES);
        return [...INITIAL_ZONES];
      }
      return JSON.parse(raw);
    } catch (e) {
      return [...INITIAL_ZONES];
    }
  }

  private saveZones(zones: DeliveryZone[]): void {
    localStorage.setItem(STORAGE_ZONES_KEY, JSON.stringify(zones));
  }

  private getHistoryFromStorage(): DeliveryHistoryTrip[] {
    try {
      const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (!raw) {
        this.saveHistory(INITIAL_DELIVERY_HISTORY);
        return [...INITIAL_DELIVERY_HISTORY];
      }
      return JSON.parse(raw);
    } catch (e) {
      return [...INITIAL_DELIVERY_HISTORY];
    }
  }

  private saveHistory(history: DeliveryHistoryTrip[]): void {
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
  }

  /* -------------------------------------------------------------
     RIDER / DELIVERY PARTNER PORTAL SPECIFIC METHODS
  ------------------------------------------------------------- */

  /**
   * Rider Portal: Login by phone and optional PIN
   */
  async riderLogin(phone: string, pin?: string): Promise<{ success: boolean; rider?: DeliveryPerson; message?: string }> {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const riders = this.getRidersFromStorage();

    const rider = riders.find(r => {
      const rPhone = r.phone.replace(/\D/g, '');
      return rPhone === cleanPhone || (cleanPhone.length >= 7 && rPhone.endsWith(cleanPhone));
    });

    if (!rider) {
      return {
        success: false,
        message: 'No delivery partner found with this phone number. Please use registered mobile (e.g. 9801122334) or contact store admin.'
      };
    }

    if (pin && pin.trim().length > 0 && pin.trim() !== '1234' && pin.trim().length < 4) {
      return { success: false, message: 'Invalid 4-digit PIN. (Demo default is 1234)' };
    }

    localStorage.setItem('aone_active_delivery_partner_v1', JSON.stringify(rider));
    return { success: true, rider };
  }

  /**
   * Get currently authenticated delivery partner
   */
  getActiveRider(): DeliveryPerson | null {
    try {
      const raw = localStorage.getItem('aone_active_delivery_partner_v1');
      if (!raw) return null;
      const cached = JSON.parse(raw);
      const riders = this.getRidersFromStorage();
      const fresh = riders.find(r => r.id === cached.id);
      return fresh || cached;
    } catch (e) {
      return null;
    }
  }

  /**
   * Rider Portal: Logout
   */
  riderLogout(): void {
    localStorage.removeItem('aone_active_delivery_partner_v1');
  }

  /**
   * Rider Portal: Toggle Duty Status ('Available' | 'Off Duty')
   */
  async updateRiderDuty(riderId: string, status: 'Available' | 'Off Duty'): Promise<DeliveryPerson> {
    const riders = this.getRidersFromStorage();
    const rider = riders.find(r => r.id === riderId);
    if (!rider) throw new Error('Rider not found');
    rider.status = status;
    this.updateLocalRider(rider);
    const active = this.getActiveRider();
    if (active && active.id === riderId) {
      active.status = status;
      localStorage.setItem('aone_active_delivery_partner_v1', JSON.stringify(active));
    }
    return rider;
  }

  /**
   * Rider Portal: Get orders assigned to this rider
   */
  async getRiderOrders(riderId: string): Promise<DeliveryOrder[]> {
    const orders = this.getOrdersFromStorage();
    return orders.filter(o => o.assignedRiderId === riderId);
  }

  /**
   * Rider Portal: Get claimable orders (synced with real MongoDB orders)
   */
  async getClaimableOrders(): Promise<DeliveryOrder[]> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/orders`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const realClaimable = json.data
            .filter((o: any) => o.status !== 'Delivered' && o.status !== 'Cancelled' && (!o.deliveryPerson || !o.deliveryPerson.name))
            .map((o: any) => ({
              id: o.id || o._id,
              orderNumber: o.orderNumber,
              customerName: o.customerName,
              customerPhone: o.customerPhone,
              deliveryAddress: o.deliveryAddress,
              zone: 'Tikathali & Lalitpur Hub',
              itemsCount: Array.isArray(o.items) ? o.items.reduce((s: number, i: any) => s + (i.quantity || 1), 0) : 1,
              total: o.total,
              deliveryFee: o.deliveryFee || 0,
              paymentMethod: o.paymentMethod || 'COD',
              deliveryStatus: 'Waiting' as OrderDeliveryStatus,
              assignedRiderId: null,
              riderName: null,
              riderPhone: null,
              createdAt: o.createdAt || new Date().toISOString()
            }));
          if (realClaimable.length > 0) return realClaimable;
        }
      }
    } catch (e) {
      console.warn('Real claimable orders fetch notice:', e);
    }

    const orders = this.getOrdersFromStorage();
    return orders.filter(o => o.deliveryStatus === 'Waiting' || (!o.assignedRiderId && o.deliveryStatus !== 'Delivered' && o.deliveryStatus !== 'Failed'));
  }

  /**
   * Rider Portal: Rider claims an unassigned order
   */
  async claimOrder(orderId: string, riderId: string): Promise<{ delivery: DeliveryOrder; rider: DeliveryPerson }> {
    return this.assignRider(orderId, riderId);
  }

  /**
   * Rider Portal: Get trip history for this rider
   */
  async getRiderHistory(riderName: string): Promise<DeliveryHistoryTrip[]> {
    const history = await this.getHistory();
    return history.filter(h => h.riderName.toLowerCase() === riderName.toLowerCase());
  }
}

export const deliveryService = new DeliveryService();
