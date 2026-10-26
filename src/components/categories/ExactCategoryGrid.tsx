import React from 'react';
import { ArrowRight } from 'lucide-react';
import { EXACT_CATEGORIES, ExactCategory } from '../../data/mockData';

interface ExactCategoryGridProps {
  onSelectCategory?: (category: ExactCategory) => void;
  onViewAll?: () => void;
  isMobileLayout?: boolean;
}

export const ExactCategoryGrid: React.FC<ExactCategoryGridProps> = ({
  onSelectCategory,
  onViewAll,
  isMobileLayout = false
}) => {
  return (
    <div className="py-2.5">
      {/* Header matching the mockup */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
          Shop by Category
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 active:translate-x-0.5 transition"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Exact 2-Column Grid (2*5 = 10 cards) matching media_1790472053075.jpg */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {EXACT_CATEGORIES.map(cat => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory?.(cat)}
            className="group cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:scale-98 border border-slate-100"
          >
            {/* The exact card image extracted directly from the user's mockup */}
            <img
              src={cat.cardImage}
              alt={cat.name}
              className="w-full h-full object-cover rounded-2xl sm:rounded-3xl group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
