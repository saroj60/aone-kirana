import { Order, OrderStatus, PaymentStatus, DeliveryPerson } from '../data/mockData';
import { inventoryService } from './inventoryService';
import { getApiBaseUrl } from '../config/api';

const ORDERS_STORAGE_KEY = 'aone_admin_orders_v2';

// Purge legacy mock orders storage if existing
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('aone_admin_orders_v1');
    const legacyOrders = localStorage.getItem('aone_kirana_orders');
    if (legacyOrders && legacyOrders.includes('ord-101')) {
      localStorage.removeItem('aone_kirana_orders');
    }
  } catch (e) {
    // ignore
  }
}

// Initial orders matching Aone Kirana operations - defaults to empty list
export const INITIAL_ORDERS: Order[] = [];

export interface OrderStats {
  totalOrders: number;
  newOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  readyOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export const normalizeOrder = (order: any): Order => {
  const items = Array.isArray(order?.items)
    ? order.items.map((it: any) => {
        const product = it.product || {
          id: it.productId || it.id || 'prod-custom',
          name: it.name || 'Product',
          price: it.price !== undefined ? it.price : 0,
          unit: it.unit || '1 pc',
          image: it.image || '/logo.png',
          category: it.category || 'Grocery',
          inStock: true
        };
        return {
          ...it,
          product,
          quantity: it.quantity || 1
        };
      })
    : [];

  return {
    ...order,
    items
  };
};

class AdminOrderService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('aone_admin_jwt_token') || sessionStorage.getItem('aone_admin_jwt_token');
    if (token) return { Authorization: `Bearer ${token}` };
    return {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsInJvbGUiOiJhZG1pbiJ9.mock_jwt_signature`
    };
  }

  /**
   * Get all orders with filtering and search
   */
  async getOrders(filters?: {
    status?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    dateRange?: string;
    search?: string;
  }): Promise<{ orders: Order[]; stats: OrderStats }> {
    // 1. Try Backend API
    try {
      const q = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') q.set('status', filters.status);
      if (filters?.paymentMethod && filters.paymentMethod !== 'all') q.set('paymentMethod', filters.paymentMethod);
      if (filters?.paymentStatus && filters.paymentStatus !== 'all') q.set('paymentStatus', filters.paymentStatus);
      if (filters?.dateRange && filters.dateRange !== 'all') q.set('dateRange', filters.dateRange);
      if (filters?.search) q.set('search', filters.search);

      const res = await fetch(`${getApiBaseUrl()}/orders?${q.toString()}`, {
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const normalized = json.data.map(normalizeOrder);
          this.saveOrders(normalized);
          const stats = this.computeStats(normalized);
          return { orders: normalized, stats };
        }
      }
    } catch (e) {
      console.warn('Backend orders offline, using local storage:', e);
    }

    // 2. Local fallback
    const all = this.getOrdersFromStorage();
    let filtered = [...all];

    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(o => o.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters?.paymentMethod && filters.paymentMethod !== 'all') {
      filtered = filtered.filter(o => o.paymentMethod.toLowerCase() === filters.paymentMethod?.toLowerCase());
    }

    if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
      filtered = filtered.filter(o => o.paymentStatus?.toLowerCase() === filters.paymentStatus?.toLowerCase());
    }

    if (filters?.dateRange && filters.dateRange !== 'all') {
      const now = Date.now();
      if (filters.dateRange === 'today') {
        const startOfDay = new Date().setHours(0, 0, 0, 0);
        filtered = filtered.filter(o => new Date(o.createdAt).getTime() >= startOfDay);
      } else if (filters.dateRange === 'yesterday') {
        const startOfYesterday = new Date(now - 86400000).setHours(0, 0, 0, 0);
        const endOfYesterday = new Date(now - 86400000).setHours(23, 59, 59, 999);
        filtered = filtered.filter(o => {
          const t = new Date(o.createdAt).getTime();
          return t >= startOfYesterday && t <= endOfYesterday;
        });
      } else if (filters.dateRange === 'week') {
        const weekAgo = now - 7 * 86400000;
        filtered = filtered.filter(o => new Date(o.createdAt).getTime() >= weekAgo);
      } else if (filters.dateRange === 'month') {
        const monthAgo = now - 30 * 86400000;
        filtered = filtered.filter(o => new Date(o.createdAt).getTime() >= monthAgo);
      }
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.deliveryAddress.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const stats = this.computeStats(all);

    return { orders: filtered, stats };
  }

  /**
   * Update Order Status and synchronize Inventory
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    cancellationReason?: string
  ): Promise<Order> {
    const all = this.getOrdersFromStorage();
    const order = all.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new Error('Order not found');

    const previousStatus = order.status;

    // 1. Try Backend API
    try {
      const res = await fetch(`${getApiBaseUrl()}/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify({ status: newStatus, note, cancellationReason })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.updateLocalOrder(json.data);
          this.syncInventoryForStatusChange(order, previousStatus, newStatus, cancellationReason);
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend order update failed, processing locally:', e);
    }

    // 2. Local Update
    order.status = newStatus;
    if (newStatus === 'Cancelled' && cancellationReason) {
      order.cancellationReason = cancellationReason;
    }
    if (newStatus === 'Delivered' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'Paid';
    }

    if (!order.orderTimeline) order.orderTimeline = [];
    order.orderTimeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || (newStatus === 'Cancelled' ? cancellationReason || 'Order cancelled' : `Status changed to ${newStatus}`)
    });

    this.updateLocalOrder(order);
    this.syncInventoryForStatusChange(order, previousStatus, newStatus, cancellationReason);

    return order;
  }

  /**
   * Assign Delivery Rider
   */
  async assignDeliveryPerson(orderId: string, deliveryPerson: DeliveryPerson): Promise<Order> {
    const all = this.getOrdersFromStorage();
    const order = all.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new Error('Order not found');

    // Try API
    try {
      const res = await fetch(`${getApiBaseUrl()}/orders/${order.id}/assign-rider`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify({ deliveryPerson })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.updateLocalOrder(json.data);
          return json.data;
        }
      }
    } catch (e) {
      // ignore
    }

    order.deliveryPerson = deliveryPerson;
    order.riderName = deliveryPerson.name;
    order.riderPhone = deliveryPerson.phone;

    if (!order.orderTimeline) order.orderTimeline = [];
    order.orderTimeline.push({
      status: order.status,
      timestamp: new Date().toISOString(),
      note: `Assigned to delivery partner: ${deliveryPerson.name} (${deliveryPerson.vehicle})`
    });

    this.updateLocalOrder(order);
    return order;
  }

  /**
   * Update Payment Status
   */
  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
    const all = this.getOrdersFromStorage();
    const order = all.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new Error('Order not found');

    // Try API
    try {
      const res = await fetch(`${getApiBaseUrl()}/orders/${order.id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify({ paymentStatus })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.updateLocalOrder(json.data);
          return json.data;
        }
      }
    } catch (e) {
      // ignore
    }

    order.paymentStatus = paymentStatus;
    this.updateLocalOrder(order);
    return order;
  }

  /**
   * Business Logic: Synchronize Inventory on Order Status Change
   * - Confirmed: Deducts stock for each item ordered
   * - Cancelled: Replenishes stock for each item back to warehouse
   */
  private async syncInventoryForStatusChange(
    order: Order,
    previousStatus: OrderStatus,
    newStatus: OrderStatus,
    cancellationReason?: string
  ) {
    if (!order.items || order.items.length === 0) return;

    try {
      // 1. Order Confirmed: Deduct stock if transitioning from New
      if (newStatus === 'Confirmed' && previousStatus === 'New') {
        for (const item of order.items) {
          const productId = item.product.id;
          const qty = item.quantity;
          try {
            await inventoryService.stockOut({
              productId,
              quantity: qty,
              reason: `Order confirmed #${order.orderNumber} dispatch allocation`,
              notes: `Customer: ${order.customerName}`,
              allowNegativeStock: true
            });
          } catch (err) {
            console.warn(`Inventory deduction error for ${item.product.name}:`, err);
          }
        }
      }

      // 2. Order Cancelled: Restore inventory if previously confirmed/prepared
      if (newStatus === 'Cancelled' && previousStatus !== 'Cancelled') {
        for (const item of order.items) {
          const productId = item.product.id;
          const qty = item.quantity;
          try {
            await inventoryService.stockIn({
              productId,
              quantity: qty,
              reason: `Order cancelled #${order.orderNumber} stock return`,
              notes: `Cancellation reason: ${cancellationReason || 'Admin cancelled'}`
            });
          } catch (err) {
            console.warn(`Inventory restock error for ${item.product.name}:`, err);
          }
        }
      }
    } catch (e) {
      console.warn('Error syncing inventory with order:', e);
    }
  }

  resetToDefaults(): Order[] {
    try {
      localStorage.removeItem(ORDERS_STORAGE_KEY);
    } catch (e) {}
    return [];
  }

  private computeStats(all: Order[]): OrderStats {
    return {
      totalOrders: all.length,
      newOrders: all.filter(o => o.status === 'New').length,
      confirmedOrders: all.filter(o => o.status === 'Confirmed').length,
      preparingOrders: all.filter(o => o.status === 'Preparing').length,
      readyOrders: all.filter(o => o.status === 'Ready for Delivery').length,
      outForDeliveryOrders: all.filter(o => o.status === 'Out for Delivery').length,
      deliveredOrders: all.filter(o => o.status === 'Delivered').length,
      cancelledOrders: all.filter(o => o.status === 'Cancelled').length,
      totalRevenue: all
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0)
    };
  }

  private getOrdersFromStorage(): Order[] {
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (!raw) {
        this.saveOrders(INITIAL_ORDERS);
        return INITIAL_ORDERS.map(normalizeOrder);
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeOrder) : INITIAL_ORDERS.map(normalizeOrder);
    } catch (e) {
      return INITIAL_ORDERS.map(normalizeOrder);
    }
  }

  private saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage:', e);
    }
  }

  private updateLocalOrder(updated: Order): void {
    const list = this.getOrdersFromStorage();
    const idx = list.findIndex(o => o.id === updated.id || o.orderNumber === updated.orderNumber);
    if (idx !== -1) {
      list[idx] = updated;
    } else {
      list.unshift(updated);
    }
    this.saveOrders(list);
  }
}

export const adminOrderService = new AdminOrderService();
