import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface AdminCardProps {
  title: string;
  value: string | number;
  change?: number; // e.g. +12.5 or -3.2
  periodText?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  indicatorColor?: 'emerald' | 'amber' | 'rose' | 'blue';
  prefix?: string;
}

export const AdminCard: React.FC<AdminCardProps> = ({
  title,
  value,
  change,
  periodText = 'vs yesterday',
  icon: Icon,
  iconBgColor = 'bg-brand-50',
  iconColor = 'text-brand-700',
  indicatorColor = 'emerald',
  prefix
}) => {
  const isPositive = change !== undefined ? change >= 0 : true;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider line-clamp-1">{title}</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            {prefix && <span className="text-sm font-bold text-slate-500">{prefix}</span>}
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
          </div>
        </div>
        <div className={`w-11 h-11 rounded-2xl ${iconBgColor} ${iconColor} flex items-center justify-center flex-shrink-0 shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {change !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-slate-400 font-medium">{periodText}</span>
          </div>
        ) : (
          <span className="text-slate-400 font-medium">{periodText}</span>
        )}

        {/* Small Visual Indicator Pill */}
        <span
          className={`w-2 h-2 rounded-full ${
            indicatorColor === 'emerald'
              ? 'bg-emerald-500 ring-4 ring-emerald-100'
              : indicatorColor === 'amber'
              ? 'bg-amber-500 ring-4 ring-amber-100'
              : indicatorColor === 'rose'
              ? 'bg-rose-500 ring-4 ring-rose-100'
              : 'bg-blue-500 ring-4 ring-blue-100'
          }`}
        />
      </div>
    </div>
  );
};
