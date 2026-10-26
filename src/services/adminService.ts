import { Product, Order, ALL_PRODUCTS } from '../data/mockData';

export interface DashboardStats {
  todayOrders: number;
  todayOrdersChange: number; // percentage e.g. +12.5
  todaySales: number;
  todaySalesChange: number; // e.g. +8.2
  totalCustomers: number;
  totalCustomersChange: number; // e.g. +5.4
  lowStockProducts: number;
  lowStockChange: number; // e.g. -2.0
  pendingDeliveries: number;
  pendingDeliveriesChange: number;
  cancelledOrders: number;
  cancelledOrdersChange: number;
}

export type SalesPeriod = 'today' | '7days' | '30days' | '12months';

export interface SalesDataPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusSummary {
  status: 'New' | 'Confirmed' | 'Preparing' | 'Ready' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  count: number;
  percentage: number;
  color: string;
}

export interface TopProductItem {
  id: string;
  name: string;
  category: string;
  image: string;
  unitsSold: number;
  revenue: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface LowStockItem {
  id: string;
  name: string;
  image: string;
  category: string;
  currentStock: number;
  minStock: number;
  status: 'Critical' | 'Low Stock';
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'Active' | 'Inactive';
}

export interface AdminRider {
  id: string;
  name: string;
  phone: string;
  activeOrders: number;
  status: 'Available' | 'On Delivery' | 'Off Duty';
  rating: number;
  vehicle: string;
}

export interface CouponItem {
  id: string;
  code: string;
  discountPercentage: number;
  minOrder: number;
  validUntil: string;
  usageCount: number;
  isActive: boolean;
}

// REST API Base URL (configured for future Express / Node.js backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Admin Service:
 * Handles REST API communication with the backend.
 * Falls back gracefully to initial structured mock data if the backend is not yet connected.
 */
class AdminService {
  // 1. Dashboard Summary Statistics
  async getDashboardStats(orders: Order[] = []): Promise<DashboardStats> {
    try {
      // In production with Express backend:
      // const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      // if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend REST API not reachable, using local calculations:', e);
    }

    const todaySales = orders.reduce((sum, o) => sum + (o.total || 0), 0) + 12450;
    const todayOrdersCount = orders.length + 24;

    return {
      todayOrders: todayOrdersCount,
      todayOrdersChange: 14.8,
      todaySales: todaySales,
      todaySalesChange: 12.3,
      totalCustomers: 184,
      totalCustomersChange: 8.5,
      lowStockProducts: 6,
      lowStockChange: -3.2,
      pendingDeliveries: orders.filter(o => o.status !== 'Delivered').length + 5,
      pendingDeliveriesChange: 4.1,
      cancelledOrders: 2,
      cancelledOrdersChange: -15.0
    };
  }

  // 2. Sales Chart Analytics
  async getSalesData(period: SalesPeriod): Promise<SalesDataPoint[]> {
    try {
      // const res = await fetch(`${API_BASE_URL}/admin/sales?period=${period}`);
      // if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }

    if (period === 'today') {
      return [
        { label: '6 AM', revenue: 1200, orders: 4 },
        { label: '8 AM', revenue: 3800, orders: 9 },
        { label: '10 AM', revenue: 6400, orders: 15 },
        { label: '12 PM', revenue: 5100, orders: 11 },
        { label: '2 PM', revenue: 4200, orders: 8 },
        { label: '4 PM', revenue: 7600, orders: 18 },
        { label: '6 PM', revenue: 9800, orders: 22 },
        { label: '8 PM', revenue: 6100, orders: 13 },
        { label: '10 PM', revenue: 2100, orders: 5 }
      ];
    }

    if (period === '7days') {
      return [
        { label: 'Mon', revenue: 28400, orders: 54 },
        { label: 'Tue', revenue: 31200, orders: 62 },
        { label: 'Wed', revenue: 26800, orders: 48 },
        { label: 'Thu', revenue: 34500, orders: 71 },
        { label: 'Fri', revenue: 42900, orders: 89 },
        { label: 'Sat', revenue: 56200, orders: 114 },
        { label: 'Sun', revenue: 49800, orders: 98 }
      ];
    }

    if (period === '30days') {
      return [
        { label: 'Week 1', revenue: 184500, orders: 380 },
        { label: 'Week 2', revenue: 212400, orders: 440 },
        { label: 'Week 3', revenue: 198600, orders: 410 },
        { label: 'Week 4', revenue: 245800, orders: 520 }
      ];
    }

    // 12 months
    return [
      { label: 'Jan', revenue: 480000, orders: 1100 },
      { label: 'Feb', revenue: 520000, orders: 1240 },
      { label: 'Mar', revenue: 610000, orders: 1450 },
      { label: 'Apr', revenue: 580000, orders: 1390 },
      { label: 'May', revenue: 640000, orders: 1520 },
      { label: 'Jun', revenue: 710000, orders: 1680 },
      { label: 'Jul', revenue: 690000, orders: 1610 },
      { label: 'Aug', revenue: 740000, orders: 1740 },
      { label: 'Sep', revenue: 810000, orders: 1920 },
      { label: 'Oct', revenue: 950000, orders: 2240 },
      { label: 'Nov', revenue: 880000, orders: 2050 },
      { label: 'Dec', revenue: 920000, orders: 2180 }
    ];
  }

  // 3. Order Status Breakdown
  async getOrderStatusSummary(orders: Order[] = []): Promise<OrderStatusSummary[]> {
    const defaultDistribution: Record<string, number> = {
      'New': 5,
      'Confirmed': 8,
      'Preparing': 6,
      'Ready': 4,
      'Out for Delivery': 7,
      'Delivered': 48,
      'Cancelled': 2
    };

    // Blend live order statuses if available
    orders.forEach(o => {
      const st = o.status;
      if (defaultDistribution[st] !== undefined) {
        defaultDistribution[st]++;
      }
    });

    const total = Object.values(defaultDistribution).reduce((a, b) => a + b, 0);

    const colors: Record<string, string> = {
      'New': 'bg-blue-500 text-white',
      'Confirmed': 'bg-indigo-500 text-white',
      'Preparing': 'bg-amber-500 text-white',
      'Ready': 'bg-teal-500 text-white',
      'Out for Delivery': 'bg-orange-500 text-white',
      'Delivered': 'bg-emerald-600 text-white',
      'Cancelled': 'bg-rose-500 text-white'
    };

    return Object.entries(defaultDistribution).map(([status, count]) => ({
      status: status as any,
      count,
      percentage: Math.round((count / total) * 100),
      color: colors[status] || 'bg-slate-500 text-white'
    }));
  }

  // 4. Top Selling Products
  async getTopProducts(): Promise<TopProductItem[]> {
    return [
      {
        id: 'prod-amul-taaza',
        name: 'Amul Taaza Milk (1 L)',
        category: 'Dairy',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop&q=80',
        unitsSold: 342,
        revenue: 37620,
        stock: 45,
        status: 'In Stock'
      },
      {
        id: 'prod-surf-excel',
        name: 'Surf Excel Detergent (2 kg)',
        category: 'Household',
        image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=200&auto=format&fit=crop&q=80',
        unitsSold: 215,
        revenue: 96750,
        stock: 18,
        status: 'In Stock'
      },
      {
        id: 'prod-tomato',
        name: 'Fresh Farm Tomatoes (1 kg)',
        category: 'Vegetables',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80',
        unitsSold: 410,
        revenue: 32800,
        stock: 6,
        status: 'Low Stock'
      },
      {
        id: 'prod-jeera-masino',
        name: 'Jeera Masino Rice (1 kg)',
        category: 'Grains',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=80',
        unitsSold: 198,
        revenue: 21780,
        stock: 52,
        status: 'In Stock'
      },
      {
        id: 'prod-fortune-oil',
        name: 'Fortune Sunflower Oil (1 L)',
        category: 'Essentials',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&auto=format&fit=crop&q=80',
        unitsSold: 165,
        revenue: 32835,
        stock: 3,
        status: 'Low Stock'
      }
    ];
  }

  // 5. Low Stock Products with Interactive Updates
  async getLowStockProducts(): Promise<LowStockItem[]> {
    return [
      {
        id: 'prod-fortune-oil',
        name: 'Fortune Sunflower Oil (1 L)',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&auto=format&fit=crop&q=80',
        category: 'Essentials',
        currentStock: 3,
        minStock: 15,
        status: 'Critical'
      },
      {
        id: 'prod-tomato',
        name: 'Fresh Farm Tomatoes (1 kg)',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80',
        category: 'Vegetables',
        currentStock: 6,
        minStock: 25,
        status: 'Critical'
      },
      {
        id: 'prod-bread',
        name: 'Fresh White Bread (400 g)',
        image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=200&auto=format&fit=crop&q=80',
        category: 'Bakery',
        currentStock: 4,
        minStock: 20,
        status: 'Critical'
      },
      {
        id: 'prod-local-eggs',
        name: 'Local Country Eggs (10 pcs)',
        image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&auto=format&fit=crop&q=80',
        category: 'Dairy',
        currentStock: 8,
        minStock: 30,
        status: 'Low Stock'
      },
      {
        id: 'prod-pampers',
        name: 'Pampers Baby Diapers (M, 64 pcs)',
        image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&auto=format&fit=crop&q=80',
        category: 'Baby Care',
        currentStock: 5,
        minStock: 12,
        status: 'Low Stock'
      },
      {
        id: 'prod-vim-liquid',
        name: 'Vim Dishwash Liquid (500 ml)',
        image: 'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?w=200&auto=format&fit=crop&q=80',
        category: 'Household',
        currentStock: 9,
        minStock: 20,
        status: 'Low Stock'
      }
    ];
  }

  // 6. Customers List
  async getCustomers(): Promise<AdminCustomer[]> {
    return [
      {
        id: 'cust-1',
        name: 'Saroj Shrestha',
        email: 'saroj@example.com',
        phone: '9841234567',
        address: 'Ward 5, Tikathali Chowk, Lalitpur',
        totalOrders: 14,
        totalSpent: 16850,
        lastOrderDate: 'Today, 10:45 AM',
        status: 'Active'
      },
      {
        id: 'cust-2',
        name: 'Pooja Maharjan',
        email: 'pooja.m@gmail.com',
        phone: '9801827364',
        address: 'Sanagaun Near Siddhipur, Lalitpur',
        totalOrders: 8,
        totalSpent: 9400,
        lastOrderDate: 'Yesterday, 4:20 PM',
        status: 'Active'
      },
      {
        id: 'cust-3',
        name: 'Bipin Adhikari',
        email: 'bipin.a@outlook.com',
        phone: '9813294857',
        address: 'Imadol, Krishna Mandir Road',
        totalOrders: 19,
        totalSpent: 28400,
        lastOrderDate: 'Today, 9:15 AM',
        status: 'Active'
      },
      {
        id: 'cust-4',
        name: 'Anjali Sharma',
        email: 'anjali.s@gmail.com',
        phone: '9865123489',
        address: 'Gwarko Ring Road, Near Flyover',
        totalOrders: 4,
        totalSpent: 4200,
        lastOrderDate: '26 Sep 2026',
        status: 'Active'
      },
      {
        id: 'cust-5',
        name: 'Ramesh Karki',
        email: 'ramesh.k@gmail.com',
        phone: '9841987654',
        address: 'Lubhu Road, Mahalaxmi 7',
        totalOrders: 11,
        totalSpent: 14200,
        lastOrderDate: '25 Sep 2026',
        status: 'Active'
      }
    ];
  }

  // 7. Delivery Riders
  async getRiders(): Promise<AdminRider[]> {
    return [
      { id: 'rd-1', name: 'Bikash Tamang', phone: '9801122334', activeOrders: 2, status: 'On Delivery', rating: 4.9, vehicle: 'Hero Splendor (Ba 82 Pa 4512)' },
      { id: 'rd-2', name: 'Suman Rai', phone: '9812233445', activeOrders: 1, status: 'On Delivery', rating: 4.8, vehicle: 'Honda Dio (Ba 95 Pa 1823)' },
      { id: 'rd-3', name: 'Kiran Thapa', phone: '9841344556', activeOrders: 0, status: 'Available', rating: 4.9, vehicle: 'Yamaha FZ (Pradesh 3-02-005 Pa 9921)' },
      { id: 'rd-4', name: 'Deepak Joshi', phone: '9860455667', activeOrders: 0, status: 'Off Duty', rating: 4.7, vehicle: 'Bajaj Pulsar (Ba 70 Pa 6231)' }
    ];
  }

  // 8. Offers & Coupons
  async getCoupons(): Promise<CouponItem[]> {
    return [
      { id: 'cp-1', code: 'AONE10', discountPercentage: 10, minOrder: 500, validUntil: '31 Oct 2026', usageCount: 142, isActive: true },
      { id: 'cp-2', code: 'TIKATHALI50', discountPercentage: 15, minOrder: 1000, validUntil: '15 Nov 2026', usageCount: 89, isActive: true },
      { id: 'cp-3', code: 'FREESHIP', discountPercentage: 100, minOrder: 700, validUntil: '31 Dec 2026', usageCount: 312, isActive: true },
      { id: 'cp-4', code: 'FESTIVE20', discountPercentage: 20, minOrder: 1500, validUntil: '20 Oct 2026', usageCount: 45, isActive: false }
    ];
  }
}

export const adminService = new AdminService();
