import React from 'react';
import { TopProductItem } from '../../../services/adminService';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

interface TopProductsTableProps {
  products: TopProductItem[];
  onViewAll?: () => void;
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({
  products,
  onViewAll
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-brand-700" />
            <span>Top Performing Products</span>
          </h3>
          <p className="text-xs text-slate-400">Best selling grocery items ranked by sales volume</p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            <span>View Catalog</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pr-3 font-semibold">Product</th>
              <th className="pb-3 px-3 font-semibold">Category</th>
              <th className="pb-3 px-3 font-semibold text-right">Units Sold</th>
              <th className="pb-3 px-3 font-semibold text-right">Revenue</th>
              <th className="pb-3 px-3 font-semibold text-right">Stock</th>
              <th className="pb-3 pl-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {products.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Product with Image */}
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200/60 flex-shrink-0"
                    />
                    <span className="font-bold text-slate-900 line-clamp-1 max-w-[160px] sm:max-w-[200px]" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-3">
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </td>

                {/* Units Sold */}
                <td className="py-3 px-3 font-bold text-slate-900 text-right">
                  {item.unitsSold.toLocaleString()}
                </td>

                {/* Revenue */}
                <td className="py-3 px-3 font-black text-brand-800 text-right">
                  Rs. {item.revenue.toLocaleString()}
                </td>

                {/* Stock */}
                <td className="py-3 px-3 font-semibold text-slate-700 text-right">
                  {item.stock}
                </td>

                {/* Status */}
                <td className="py-3 pl-3 text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      item.status === 'In Stock'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : item.status === 'Low Stock'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
