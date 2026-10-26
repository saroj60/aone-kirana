import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  Clock,
  Printer,
  ChevronDown,
  ArrowUpRight,
  Eye,
  AlertTriangle,
  Award,
  Sparkles,
  PieChart,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Truck
} from 'lucide-react';
import {
  reportService,
  TimeRange,
  AnalyticsReportData
} from '../../../services/reportService';

export const ReportsView: React.FC = () => {
  // State
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState(
    new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'customers' | 'categories'>('sales');

  const [report, setReport] = useState<AnalyticsReportData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load report data from backend
  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportService.getAnalytics({
        timeRange,
        startDate: timeRange === 'custom' ? customStartDate : undefined,
        endDate: timeRange === 'custom' ? customEndDate : undefined,
        category: selectedCategory
      });
      setReport(data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [timeRange, selectedCategory]);

  const handleExportCsv = () => {
    reportService.downloadCsv(timeRange);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  // Find max revenue for chart scaling
  const maxRevenue = useMemo(() => {
    if (!report?.sales?.revenueTimeline || report.sales.revenueTimeline.length === 0) return 10000;
    return Math.max(...report.sales.revenueTimeline.map(item => item.revenue));
  }, [report]);

  // Find max orders for chart scaling
  const maxOrders = useMemo(() => {
    if (!report?.orders?.orderTimeline || report.orders.orderTimeline.length === 0) return 10;
    return Math.max(...report.orders.orderTimeline.map(item => item.orders));
  }, [report]);

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs print:border-none print:shadow-none print:p-2">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Store Reports & Business Analytics</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Backend Verified
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time sales revenue, product velocity, order fulfillment and customer retention
              </p>
            </div>
          </div>
        </div>

        {/* Export and Action buttons */}
        <div className="flex items-center gap-2 print:hidden self-start sm:self-auto">
          <button
            onClick={fetchReport}
            title="Refresh Analytics"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-700' : ''}`} />
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-700/10 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Date & Category Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs print:hidden">
        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] mr-1">Period:</span>
          {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as TimeRange[]).map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition whitespace-nowrap ${
                timeRange === t
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Custom date range pickers & Category filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {timeRange === 'custom' && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-2xl border border-slate-200">
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-slate-700 focus:outline-hidden"
              />
              <span className="text-slate-400 font-bold">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-slate-700 focus:outline-hidden"
              />
              <button
                onClick={fetchReport}
                className="ml-1 px-2 py-0.5 bg-brand-700 text-white rounded-lg text-[10px] font-bold"
              >
                Apply
              </button>
            </div>
          )}

          {/* Category filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-transparent font-bold text-slate-800 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Store Categories</option>
              <option value="Vegetables">Vegetables & Fruits</option>
              <option value="Dairy">Dairy & Eggs</option>
              <option value="Grains">Rice, Dal & Grains</option>
              <option value="Cooking Essentials">Cooking Essentials</option>
              <option value="Bakery">Bakery & Breakfast</option>
              <option value="Snacks">Snacks & Beverages</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              Rs. {report?.sales.totalRevenue.toLocaleString() || '0'}
            </div>
            <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{report?.sales.growthPercentage} vs previous period</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {report?.orders.totalOrders || 0}
            </div>
            <p className="text-[11px] text-brand-700 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{report?.orders.deliveredOrders} Delivered ({report?.orders.deliverySuccessRate})</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Order Value</span>
            <div className="text-2xl font-black text-indigo-700 mt-1">
              Rs. {report?.sales.averageOrderValue || 0}
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">
              Across completed baskets
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Customer Base & Repeat Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Retention</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {report?.customers.repeatPurchaseRate || '0%'}
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              {report?.customers.returningCustomers} returning / {report?.customers.newCustomers} new
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto text-xs font-bold print:hidden">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition whitespace-nowrap ${
            activeTab === 'sales'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales & Order Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Velocity (Best & Slow Movers)</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition whitespace-nowrap ${
            activeTab === 'customers'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Insights & Top Spenders</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Category Share & Performance</span>
        </button>
      </div>

      {/* TAB 1: SALES & ORDER CHARTS */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Revenue Chart (Dynamic Visual Bar Chart) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-700" />
                    <span>Revenue Trend (Rs.)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Aggregated revenue over {timeRange} intervals
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    Total: Rs. {report?.sales.totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Chart Bars */}
              <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
                {report?.sales.revenueTimeline.map((item, idx) => {
                  const heightPercent = Math.max(8, Math.round((item.revenue / (maxRevenue || 1)) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-10 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg whitespace-nowrap z-20 transition shadow-lg">
                        Rs. {item.revenue.toLocaleString()} ({item.orders} orders)
                      </div>

                      <div className="w-full max-w-[40px] bg-slate-100 rounded-t-xl overflow-hidden h-44 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-brand-700 to-emerald-500 rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium truncate max-w-full">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                <span>Base 0 Rs.</span>
                <span>Peak: Rs. {maxRevenue.toLocaleString()}</span>
              </div>
            </div>

            {/* 2. Order Volume Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-indigo-700" />
                    <span>Order Volume Distribution</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Orders received per {timeRange} slot
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                    {report?.orders.totalOrders} Orders
                  </span>
                </div>
              </div>

              {/* Order Bars */}
              <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
                {report?.orders.orderTimeline.map((item, idx) => {
                  const heightPercent = Math.max(8, Math.round((item.orders / (maxOrders || 1)) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-10 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg whitespace-nowrap z-20 transition shadow-lg">
                        {item.orders} Orders
                      </div>

                      <div className="w-full max-w-[40px] bg-slate-100 rounded-t-xl overflow-hidden h-44 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-indigo-600 to-blue-400 rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium truncate max-w-full">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                <span>Base 0</span>
                <span>Peak: {maxOrders} orders</span>
              </div>
            </div>
          </div>

          {/* Fulfillment Status Breakdown Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="font-extrabold text-slate-900 text-sm mb-3">Order Status Pipeline</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Delivered Orders</span>
                <span className="text-xl font-black text-emerald-700 mt-1 block">
                  {report?.orders.deliveredOrders}
                </span>
                <span className="text-[10px] text-emerald-600">Fulfilled Successfully</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Pending Delivery</span>
                <span className="text-xl font-black text-amber-700 mt-1 block">
                  {report?.orders.pendingOrders}
                </span>
                <span className="text-[10px] text-amber-600">In Prep / Dispatch</span>
              </div>

              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">Cancelled Orders</span>
                <span className="text-xl font-black text-rose-700 mt-1 block">
                  {report?.orders.cancelledOrders}
                </span>
                <span className="text-[10px] text-rose-600">Customer / Stockout</span>
              </div>

              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                <span className="text-[10px] font-bold text-indigo-800 uppercase block">Success Rate</span>
                <span className="text-xl font-black text-indigo-700 mt-1 block">
                  {report?.orders.deliverySuccessRate}
                </span>
                <span className="text-[10px] text-indigo-600">On-Time Handover</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT VELOCITY (BEST SELLERS & SLOW MOVERS) */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Best Sellers */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Best Selling Products</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Top revenue and volume drivers</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Units Sold</th>
                    <th className="py-3 px-4">In Stock</th>
                    <th className="py-3 px-4 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report?.products.bestSellers.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-3">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div>
                          <div>{p.name}</div>
                          <span className="text-[10px] text-slate-400 font-normal">{p.unit}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{p.category}</td>
                      <td className="py-3 px-4 font-black text-slate-900">{p.unitsSold} units</td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                          {p.currentStock} in stock
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-brand-800">
                        Rs. {p.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grid: Slow Moving & Most Viewed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Slow Moving Products */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Slow-Moving Products</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">High stock with low 30-day velocity</p>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {report?.products.slowMovingProducts.map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Category: {p.category} • Stock: <strong>{p.currentStock}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 block">
                        {p.daysWithoutSale} days idle
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Only {p.unitsSoldLast30Days} sold last 30d
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Viewed Products */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span>Most Viewed Products</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">High customer traffic & interest</p>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {report?.products.mostViewedProducts.map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Category: {p.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900">{p.viewsCount.toLocaleString()} views</div>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg inline-block mt-0.5">
                        {p.conversionRate} Conversion
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER INSIGHTS & TOP SPENDERS */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Customer Retention Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Customers</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {report?.customers.newCustomers}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">First-time buyers in period</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Returning Customers</span>
              <div className="text-2xl font-black text-brand-700 mt-1">
                {report?.customers.returningCustomers}
              </div>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">Ordered more than once</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Repeat Purchase Rate</span>
              <div className="text-2xl font-black text-indigo-700 mt-1">
                {report?.customers.repeatPurchaseRate}
              </div>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">High neighborhood loyalty</p>
            </div>
          </div>

          {/* Top Customers Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Top Spending Customers</h3>
                <p className="text-xs text-slate-400 mt-0.5">Highest lifetime and period value shoppers</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Orders Placed</th>
                    <th className="py-3 px-4">Average Basket</th>
                    <th className="py-3 px-4 text-right">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report?.customers.topCustomers.map(cust => (
                    <tr key={cust.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {cust.name}
                        <div className="text-[10px] text-slate-400 font-normal">
                          Last purchase:{' '}
                          {new Date(cust.lastOrderDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        <div>{cust.phone}</div>
                        <div className="text-[10px] text-slate-400">{cust.email}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{cust.ordersCount} orders</td>
                      <td className="py-3 px-4 font-semibold text-slate-600">Rs. {cust.avgOrderValue}</td>
                      <td className="py-3 px-4 text-right font-black text-brand-800">
                        Rs. {cust.totalSpent.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORY PERFORMANCE */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Category Revenue Contribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of grocery volume, orders count, and market share by department
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {report?.categoryPerformance.map((cat, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="font-extrabold text-slate-900 text-xs">{cat.categoryName}</div>
                  <div className="text-xs font-black text-brand-800">
                    Rs. {cat.revenue.toLocaleString()} ({cat.percentageShare}%)
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-brand-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentageShare}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{cat.ordersCount} total orders</span>
                  <span>{cat.itemsSold} items dispatched</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
