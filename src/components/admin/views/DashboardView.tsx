import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  DollarSign,
  Users,
  AlertTriangle,
  Truck,
  XCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { AdminCard } from '../common/AdminCard';
import { SalesChart } from '../common/SalesChart';
import { OrderStatusCards } from '../common/OrderStatusCards';
import { TopProductsTable } from '../common/TopProductsTable';
import { LowStockTable } from '../common/LowStockTable';
import { RecentOrdersTable } from '../common/RecentOrdersTable';
import {
  adminService,
  DashboardStats,
  SalesPeriod,
  SalesDataPoint,
  OrderStatusSummary,
  TopProductItem,
  LowStockItem
} from '../../../services/adminService';
import { useOrders } from '../../../context/OrderContext';
import { Order } from '../../../data/mockData';
import { AdminTab } from '../layout/AdminSidebar';

interface DashboardViewProps {
  onNavigateTab: (tab: AdminTab) => void;
  searchFilter?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  searchFilter = ''
}) => {
  const { orders, updateOrderStatus, refreshOrders, isLoadingData } = useOrders();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>('7days');
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [orderStatusSummary, setOrderStatusSummary] = useState<OrderStatusSummary[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [st, sData, oSummary, topP, lowP] = await Promise.all([
          adminService.getDashboardStats(orders),
          adminService.getSalesData(salesPeriod),
          adminService.getOrderStatusSummary(orders),
          adminService.getTopProducts(),
          adminService.getLowStockProducts()
        ]);

        setStats(st);
        setSalesData(sData);
        setOrderStatusSummary(oSummary);
        setTopProducts(topP);
        setLowStockProducts(lowP);
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [orders, salesPeriod]);

  // Handle stock replenishment update
  const handleStockUpdated = (id: string, newStock: number, newMin: number) => {
    setLowStockProducts(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              currentStock: newStock,
              minStock: newMin,
              status: newStock <= 5 ? 'Critical' : 'Low Stock'
            }
          : p
      )
    );
  };

  // Filter recent orders
  const filteredOrders = orders.filter(o => {
    if (selectedStatusFilter && o.status !== selectedStatusFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.deliveryAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
              Hub: Tikathali, Mahalaxmi
            </span>
            <span className="text-emerald-300 text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Dispatch Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Aone Kirana Store Operations
          </h2>
          <p className="text-xs text-brand-100 mt-1">
            Real-time grocery orders, fulfillment tracking, daily sales, and automated inventory warnings.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <button
            onClick={() => refreshOrders()}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 backdrop-blur-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2.5 rounded-xl bg-white text-brand-900 hover:bg-brand-50 font-extrabold text-xs shadow-md active:scale-95 transition"
          >
            Manage Orders
          </button>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute right-0 -bottom-10 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
      </div>

      {/* DASHBOARD CARDS: 6 Required Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Today's Orders */}
        <AdminCard
          title="Today's Orders"
          value={stats ? `${stats.todayOrders}` : '...'}
          change={stats?.todayOrdersChange}
          periodText="vs yesterday"
          icon={ShoppingBag}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-700"
          indicatorColor="blue"
        />

        {/* 2. Today's Sales */}
        <AdminCard
          title="Today's Sales"
          value={stats ? `Rs. ${stats.todaySales.toLocaleString()}` : '...'}
          change={stats?.todaySalesChange}
          periodText="vs yesterday"
          icon={DollarSign}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-700"
          indicatorColor="emerald"
        />

        {/* 3. Total Customers */}
        <AdminCard
          title="Total Customers"
          value={stats ? `${stats.totalCustomers}` : '...'}
          change={stats?.totalCustomersChange}
          periodText="vs last week"
          icon={Users}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-700"
          indicatorColor="emerald"
        />

        {/* 4. Low Stock Products */}
        <AdminCard
          title="Low Stock Products"
          value={lowStockProducts.length}
          change={stats?.lowStockChange}
          periodText="needs restock"
          icon={AlertTriangle}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-700"
          indicatorColor="amber"
        />

        {/* 5. Pending Deliveries */}
        <AdminCard
          title="Pending Deliveries"
          value={stats ? `${stats.pendingDeliveries}` : '...'}
          change={stats?.pendingDeliveriesChange}
          periodText="in transit"
          icon={Truck}
          iconBgColor="bg-orange-50"
          iconColor="text-orange-700"
          indicatorColor="amber"
        />

        {/* 6. Cancelled Orders */}
        <AdminCard
          title="Cancelled Orders"
          value={stats ? `${stats.cancelledOrders}` : '...'}
          change={stats?.cancelledOrdersChange}
          periodText="this week"
          icon={XCircle}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-700"
          indicatorColor="rose"
        />
      </div>

      {/* SALES SECTION: Responsive Sales Chart */}
      <SalesChart
        data={salesData}
        period={salesPeriod}
        onPeriodChange={p => setSalesPeriod(p)}
        isLoading={isLoading}
      />

      {/* ORDER STATUS: 7 Cards Pipeline */}
      <OrderStatusCards
        summary={orderStatusSummary}
        selectedStatus={selectedStatusFilter}
        onSelectStatus={st => setSelectedStatusFilter(st)}
      />

      {/* Two Column Grid: Top Products & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOP PRODUCTS Table */}
        <TopProductsTable
          products={topProducts}
          onViewAll={() => onNavigateTab('products')}
        />

        {/* LOW STOCK Table */}
        <LowStockTable
          items={lowStockProducts}
          onStockUpdated={handleStockUpdated}
          onViewAllInventory={() => onNavigateTab('inventory')}
        />
      </div>

      {/* RECENT ORDERS: Full Table with status updates & inspector modal */}
      <RecentOrdersTable
        orders={filteredOrders}
        onUpdateStatus={updateOrderStatus}
        onViewAllOrders={() => onNavigateTab('orders')}
      />
    </div>
  );
};
