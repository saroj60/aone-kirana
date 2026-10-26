import React, { useState } from 'react';
import { SalesPeriod, SalesDataPoint } from '../../../services/adminService';
import { DollarSign, ShoppingBag, Calendar, ArrowUpRight } from 'lucide-react';

interface SalesChartProps {
  data: SalesDataPoint[];
  period: SalesPeriod;
  onPeriodChange: (p: SalesPeriod) => void;
  isLoading?: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({
  data,
  period,
  onPeriodChange,
  isLoading = false
}) => {
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'orders'>('revenue');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);

  const maxRevenue = Math.max(...data.map(d => d.revenue), 100);
  const maxOrders = Math.max(...data.map(d => d.orders), 10);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Sales & Revenue Analytics</h3>
            <span className="text-[10px] bg-brand-50 text-brand-700 font-bold px-2 py-0.5 rounded-full border border-brand-200">
              Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Track grocery order volume and gross revenue</p>
        </div>

        {/* Time-frame selector tabs */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl self-start sm:self-auto">
          {(
            [
              { key: 'today', label: 'Today' },
              { key: '7days', label: '7 Days' },
              { key: '30days', label: '30 Days' },
              { key: '12months', label: '12 Months' }
            ] as const
          ).map(tab => (
            <button
              key={tab.key}
              onClick={() => onPeriodChange(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === tab.key
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Quick Stats Toggle */}
      <div className="grid grid-cols-2 gap-3 my-4">
        <button
          onClick={() => setActiveMetric('revenue')}
          className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
            activeMetric === 'revenue'
              ? 'bg-brand-50/60 border-brand-600 ring-2 ring-brand-100'
              : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/50'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Revenue</span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900">
              Rs. {totalRevenue.toLocaleString()}
            </span>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            activeMetric === 'revenue' ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            <DollarSign className="w-4 h-4" />
          </div>
        </button>

        <button
          onClick={() => setActiveMetric('orders')}
          className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
            activeMetric === 'orders'
              ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-100'
              : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/50'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Orders</span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900">
              {totalOrders.toLocaleString()} orders
            </span>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            activeMetric === 'orders' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            <ShoppingBag className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Responsive Visual Bar Chart */}
      <div className="relative pt-6 pb-2">
        {isLoading ? (
          <div className="h-56 flex items-center justify-center text-slate-400 text-xs">
            Loading sales data...
          </div>
        ) : (
          <div className="h-56 flex items-end gap-2 sm:gap-4 px-1">
            {data.map((item, idx) => {
              const currentVal = activeMetric === 'revenue' ? item.revenue : item.orders;
              const maxVal = activeMetric === 'revenue' ? maxRevenue : maxOrders;
              const heightPercent = Math.max(Math.round((currentVal / maxVal) * 100), 8);
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Hover Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-14 z-20 bg-slate-900 text-white px-2.5 py-1.5 rounded-xl text-[11px] shadow-lg pointer-events-none whitespace-nowrap animate-fadeIn">
                      <p className="font-bold text-slate-200">{item.label}</p>
                      <p className="font-extrabold text-white">
                        {activeMetric === 'revenue' ? `Rs. ${item.revenue.toLocaleString()}` : `${item.orders} Orders`}
                      </p>
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 relative cursor-pointer ${
                      activeMetric === 'revenue'
                        ? isHovered
                          ? 'bg-brand-600 shadow-md scale-y-105'
                          : 'bg-brand-500/80 hover:bg-brand-600'
                        : isHovered
                        ? 'bg-blue-600 shadow-md scale-y-105'
                        : 'bg-blue-500/80 hover:bg-blue-600'
                    }`}
                  >
                    {/* Top Accent Line */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-t-xl" />
                  </div>

                  {/* Label */}
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-2 truncate max-w-full">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
