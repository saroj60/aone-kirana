import React from 'react';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { Product } from '../../data/mockData';
import { ProductCard } from './ProductCard';

export interface CategoryInfo {
  id: string;
  name: string;
  count?: string;
  cardImage?: string;
  prodImage?: string;
  bgColor?: string;
  arrowBg?: string;
  filterKey?: string;
}

interface CategoryProductRowProps {
  category: CategoryInfo;
  products: Product[];
  onSeeAll: () => void;
  onOpenProductDetails?: (product: Product) => void;
  isMobileLayout?: boolean;
}

export const CategoryProductRow: React.FC<CategoryProductRowProps> = ({
  category,
  products,
  onSeeAll,
  onOpenProductDetails,
  isMobileLayout = false
}) => {
  if (!products || products.length === 0) {
    return null;
  }

  // 3 lines (rows) of products:
  // On mobile (2 columns grid): 3 lines = 6 items
  // On desktop (typically 4 to 5 columns): 3 lines = 12 to 15 items
  const maxDisplayCount = isMobileLayout ? 6 : 15;
  const displayProducts = products.slice(0, maxDisplayCount);

  return (
    <section className="py-3.5 my-1 border-b border-slate-100/90 last:border-b-0">
      {/* Category Header Row */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        {/* Category Identity */}
        <div
          onClick={onSeeAll}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          {/* Category Thumbnail Image or Fallback */}
          {category.prodImage ? (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <img
                src={category.prodImage}
                alt={category.name}
                className="w-full h-full object-contain rounded-lg"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/70 flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors tracking-tight">
                {category.name}
              </h3>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition group-hover:translate-x-0.5" />
            </div>
            {category.count && (
              <p className="text-[11px] font-medium text-slate-500">
                {category.count}
              </p>
            )}
          </div>
        </div>

        {/* "See all" Button */}
        <button
          onClick={onSeeAll}
          className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 active:scale-95 border border-purple-200 shadow-2xs transition-all"
          aria-label={`See all ${category.name}`}
        >
          <span>See all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 Lines Grid Showcase */}
      <div
        className={
          isMobileLayout
            ? "grid grid-cols-2 gap-2 sm:gap-3"
            : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
        }
      >
        {displayProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenDetails={onOpenProductDetails}
          />
        ))}
      </div>

      {/* Bottom "See all" footer banner if more items exist */}
      {products.length > maxDisplayCount && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={onSeeAll}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50/70 hover:bg-purple-100 border border-purple-200/80 flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <span>See all {products.length}+ products in {category.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
};
