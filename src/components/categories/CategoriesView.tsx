import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { ProductCard } from '../home/ProductCard';
import { ExactCategoryGrid } from './ExactCategoryGrid';
import { FruitsVegetablesPage } from '../category-pages/FruitsVegetablesPage';
import { RiceDalGrainsPage } from '../category-pages/RiceDalGrainsPage';
import { CookingEssentialsPage } from '../category-pages/CookingEssentialsPage';
import { DairyEggsPage } from '../category-pages/DairyEggsPage';
import { BakeryBreakfastPage } from '../category-pages/BakeryBreakfastPage';
import { PersonalCarePage } from '../category-pages/PersonalCarePage';
import { HouseholdItemsPage } from '../category-pages/HouseholdItemsPage';
import { BabyCarePage } from '../category-pages/BabyCarePage';
import { ExactCategory, Product } from '../../data/mockData';
import { ArrowLeft, Search, X } from 'lucide-react';

interface CategoriesViewProps {
  initialCategory?: any;
  onOpenProductDetails?: (product: Product) => void;
  isMobileLayout?: boolean;
  onSelectCategory?: (category: any) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  initialCategory,
  onOpenProductDetails,
  isMobileLayout = false,
  onSelectCategory
}) => {
  const { products } = useOrders();
  const [selectedCat, setSelectedCat] = useState<ExactCategory | null>(() => {
    return onSelectCategory ? null : (initialCategory || null);
  });
  const [search, setSearch] = useState('');

  // 1. If Vegetables & Fruits is selected, display the exact Fruit and Vegetable page matching media_1790472471159.png!
  if (selectedCat && (selectedCat.name.toLowerCase().includes('vegetable') || selectedCat.id.includes('veg'))) {
    return (
      <FruitsVegetablesPage
        onBack={() => setSelectedCat(null)}
        onOpenProductDetails={onOpenProductDetails}
      />
    );
  }

  // 2. If Rice, Dal & Grains is selected, display the exact Rice Dal & Grains page matching media_1790472665703.png!
  if (selectedCat && (selectedCat.name.toLowerCase().includes('rice') || selectedCat.name.toLowerCase().includes('grain') || selectedCat.id.includes('grain'))) {
    return (
      <RiceDalGrainsPage
        onBack={() => setSelectedCat(null)}
        onOpenProductDetails={onOpenProductDetails}
      />
    );
  }

  // 3. If Cooking Essentials is selected, display the exact Cooking Essentials page matching media_1790473684524.png!
  if (selectedCat && (selectedCat.name.toLowerCase().includes('cooking') || selectedCat.name.toLowerCase().includes('essential') || selectedCat.id.includes('essential') || selectedCat.id.includes('cook'))) {
    return (
      <CookingEssentialsPage
        onBack={() => setSelectedCat(null)}
        onOpenProductDetails={onOpenProductDetails}
      />
    );
  }

  // 4. If Dairy & Eggs is selected, display the exact Dairy & Eggs page matching media_1790473970647.png!
  if (selectedCat && (selectedCat.name.toLowerCase().includes('dairy') || selectedCat.name.toLowerCase().includes('egg') || selectedCat.id.includes('dairy'))) {
    return (
      <DairyEggsPage
        onBack={() => setSelectedCat(null)}
        onOpenProductDetails={onOpenProductDetails}
      />
    );
  }

  // 5. If Bakery & Breakfast is selected, display the exact Bakery & Breakfast page matching media_1790474496906.png!
  if (selectedCat && (selectedCat.name.toLowerCase().includes('bakery') || selectedCat.name.toLowerCase().includes('breakfast') || selectedCat.name.toLowerCase().includes('bread') || selectedCat.id.includes('bakery'))) {
    return (
      <BakeryBreakfastPage
        onBack={() => setSelectedCat(null)}
        onOpenProductDetails={onOpenProductDetails}
      />
    );
  }

  // 6. If Baby Care is selected, display the exact Baby Care page matching media_1790475398260.png!
  if (selectedCat && (selectedCat.name.toLowerCase().includes('baby') || selectedCat.id.includes('baby'))) {
    return (
      <BabyCarePage
        onBack={() => setSelectedCat(null)}
        onOpenProductDetails={onOpenProductDetails}
      />
    );
  }

  // 7. If Personal Care is selected, display the exact Personal Care page matching media_1790474985753.png!
  if (selectedCat && (selectedCat.name.toLowerCase().includes('personal') || selectedCat.id.includes('personal') || selectedCat.filterKey === 'PersonalCare')) {
    return (
      <PersonalCarePage
        onBack={() => setSelectedCat(null)}
        onOpenProductDetails={onOpenProductDetails}
      />
    );
  }

  // 8. If Household Items is selected, display the exact Household Items page matching media_1790475220980.png!
  if (selectedCat && (selectedCat.name.toLowerCase().includes('household') || selectedCat.name.toLowerCase().includes('cleaning') || selectedCat.id.includes('household') || selectedCat.filterKey === 'Household')) {
    return (
      <HouseholdItemsPage
        onBack={() => setSelectedCat(null)}
        onOpenProductDetails={onOpenProductDetails}
      />
    );
  }

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCat
      ? selectedCat.filterKey === 'all' ||
        (selectedCat.filterKey === 'Vegetables' && (p.category === 'Vegetables' || p.category === 'Fruits')) ||
        (selectedCat.filterKey === 'Grains' && p.category === 'Grains') ||
        (selectedCat.filterKey === 'Essentials' && p.category === 'Essentials') ||
        (selectedCat.filterKey === 'Snacks' && p.category === 'Snacks') ||
        (selectedCat.filterKey === 'Dairy' && p.category === 'Dairy') ||
        (selectedCat.filterKey === 'Bakery' && p.category === 'Bakery') ||
        (selectedCat.filterKey === 'PersonalCare' && (p.category === 'PersonalCare' || p.category === 'BabyCare')) ||
        (selectedCat.filterKey === 'Household' && p.category === 'Household')
      : true;

    const matchesSearch = search.trim()
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      : true;

    return matchesCat && matchesSearch;
  });

  return (
    <div className="px-4 py-3 pb-24 animate-fadeIn">
      {/* Search Bar at Top */}
      <div className="mb-4">
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-brand-200 focus-within:border-brand-600 transition shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for products (e.g. rice, milk, bread...)"
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {search.trim() ? (
        <div>
          {/* Active Search Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Search Results for "{search}"
              </h3>
              <p className="text-xs text-slate-500">
                Found {filteredProducts.length} matching products
              </p>
            </div>
            <button
              onClick={() => setSearch('')}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200 transition active:scale-95"
            >
              Clear Search
            </button>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length > 0 ? (
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
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 p-6">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No products found matching "{search}"</p>
              <p className="text-xs text-slate-400 mt-1">Try another keyword or browse categories</p>
              <button
                onClick={() => setSearch('')}
                className="mt-3 px-4 py-2 bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      ) : selectedCat ? (
        <div>
          {/* Active Category Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <button
              onClick={() => setSelectedCat(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Categories</span>
            </button>
            <span className="text-xs font-black text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
              {selectedCat.name} ({selectedCat.count})
            </span>
          </div>

          {/* Product Cards Grid: 2*2 on Mobile, 4-6 on Desktop */}
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 p-6">
              <p className="text-sm font-bold text-slate-600">No items currently in this subcategory</p>
              <button
                onClick={() => setSelectedCat(null)}
                className="mt-3 px-4 py-2 bg-brand-700 text-white text-xs font-bold rounded-xl"
              >
                Browse All Categories
              </button>
            </div>
          )}
        </div>
      ) : (
        /* The Exact 10-Category 2-Column Grid matching media_1790472053075.jpg */
        <ExactCategoryGrid
          onSelectCategory={cat => {
            if (onSelectCategory) {
              onSelectCategory(cat);
            } else {
              setSelectedCat(cat);
            }
          }}
          isMobileLayout={isMobileLayout}
        />
      )}
    </div>
  );
};
