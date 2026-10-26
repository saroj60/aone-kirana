import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { ProductCard } from './ProductCard';
import { Product } from '../../data/mockData';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedProductsProps {
  onOpenProductDetails?: (product: Product) => void;
  onViewAll?: () => void;
  isMobileLayout?: boolean;
}

type TabType = 'All' | 'Vegetables' | 'Dairy' | 'Grains' | 'Snacks' | 'Beverages';

interface CategoryTab {
  id: TabType;
  label: string;
  image?: string;
  isAll?: boolean;
}

const TABS: CategoryTab[] = [
  {
    id: 'All',
    label: 'All',
    isAll: true
  },
  {
    id: 'Vegetables',
    label: 'Vegetables',
    image: '/categories/vegetables_fruits_prod.png'
  },
  {
    id: 'Dairy',
    label: 'Dairy',
    image: '/categories/dairy_eggs_prod.png'
  },
  {
    id: 'Grains',
    label: 'Grains',
    image: '/categories/rice_dal_grains_prod.png'
  },
  {
    id: 'Snacks',
    label: 'Snacks',
    image: '/categories/snacks_beverages_prod.png'
  },
  {
    id: 'Beverages',
    label: 'Beverages',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&auto=format&fit=crop&q=80'
  }
];

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  onOpenProductDetails,
  onViewAll,
  isMobileLayout = false
}) => {
  const { products } = useOrders();
  const [activeTab, setActiveTab] = useState<TabType>('All');

  const filteredProducts = products.filter(product => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Vegetables') return product.category === 'Vegetables' || product.category === 'Fruits';
    if (activeTab === 'Dairy') return product.category === 'Dairy';
    if (activeTab === 'Grains') return product.category === 'Grains';
    if (activeTab === 'Snacks') return product.category === 'Snacks';
    if (activeTab === 'Beverages') return product.name.toLowerCase().includes('coke') || product.name.toLowerCase().includes('juice');
    return true;
  });

  return (
    <div className="py-3">
      {/* Header Row: Title and View All Link */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Featured Products
        </h3>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 active:translate-x-0.5 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sticky Category Filter Sub-Navbar while scrolling */}
      <div className="sticky top-[55px] lg:top-[68px] z-20 -mx-4 px-4 lg:mx-0 lg:px-0 py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-100/90 shadow-2xs flex items-center gap-2 overflow-x-auto no-scrollbar transition-all mb-3">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                isActive
                  ? 'bg-brand-50 text-brand-800 border-brand-600 shadow-2xs ring-1 ring-brand-600/30'
                  : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.isAll ? (
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    isActive ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0 p-0.5">
                  <img
                    src={tab.image}
                    alt={tab.label}
                    className="w-full h-full object-contain rounded-full"
                    onError={e => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Product Cards Grid: 2*2 on Mobile, 6-column on Desktop */}
      <div
        className={
          isMobileLayout
            ? "grid grid-cols-2 gap-2 sm:gap-3.5"
            : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4"
        }
      >
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenDetails={onOpenProductDetails}
          />
        ))}
      </div>
    </div>
  );
};
