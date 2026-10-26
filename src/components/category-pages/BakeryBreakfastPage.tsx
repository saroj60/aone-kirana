import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  ShoppingCart,
  Leaf,
  ShieldCheck,
  Truck,
  ChevronRight,
  ArrowUpDown,
  SlidersHorizontal,
  Heart,
  Plus,
  Minus,
  X
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { useWishlist } from '../../context/WishlistContext';
import { Product } from '../../data/mockData';

interface BakeryBreakfastPageProps {
  onBack: () => void;
  onOpenProductDetails?: (product: Product) => void;
}

type BakerySubCategoryKey =
  | 'all'
  | 'bread'
  | 'biscuits'
  | 'cakes'
  | 'croissants'
  | 'rusk'
  | 'cereals'
  | 'spreads'
  | 'other';

export const BakeryBreakfastPage: React.FC<BakeryBreakfastPageProps> = ({
  onBack,
  onOpenProductDetails
}) => {
  const { totalItems, setIsCartOpen, addToCart, updateQuantity, getItemQuantity } = useCart();
  const { products } = useOrders();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [activeSubCat, setActiveSubCat] = useState<BakerySubCategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [filterDiscountOnly, setFilterDiscountOnly] = useState(false);

  // Subcategory circles matching media_1790474496906.png
  const subCategoryCircles = [
    { key: 'all' as BakerySubCategoryKey, label: 'All', isAll: true },
    { key: 'bread' as BakerySubCategoryKey, label: 'Bread & Buns', img: '/bakery/bread_circle.png' },
    { key: 'biscuits' as BakerySubCategoryKey, label: 'Biscuits & Cookies', img: '/bakery/biscuits_circle.png' },
    { key: 'cakes' as BakerySubCategoryKey, label: 'Cakes & Pastries', img: '/bakery/cakes_circle.png' },
    { key: 'croissants' as BakerySubCategoryKey, label: 'Croissants & Rolls', img: '/bakery/croissants_circle.png' },
    { key: 'rusk' as BakerySubCategoryKey, label: 'Rusk & Toast', img: '/bakery/rusk_circle.png' },
    { key: 'cereals' as BakerySubCategoryKey, label: 'Breakfast Cereals', img: '/bakery/cereals_circle.png' },
  ];

  // Left sidebar menu items
  const sidebarItems: { key: BakerySubCategoryKey; label: string }[] = [
    { key: 'all', label: 'All Products' },
    { key: 'bread', label: 'Bread & Buns' },
    { key: 'biscuits', label: 'Biscuits & Cookies' },
    { key: 'cakes', label: 'Cakes & Pastries' },
    { key: 'croissants', label: 'Croissants & Rolls' },
    { key: 'rusk', label: 'Rusk & Toast' },
    { key: 'cereals', label: 'Breakfast Cereals' },
    { key: 'spreads', label: 'Jam, Honey & Spreads' },
  ];

  // Exact 6 products from media_1790474496906.png
  const bakeryProducts: (Product & { bakerySub: BakerySubCategoryKey })[] = [
    {
      id: 'prod-fresh-white-bread',
      name: 'Fresh White Bread',
      unit: '400 g',
      price: 80,
      originalPrice: 90,
      discountPercentage: 10,
      category: 'Bakery',
      bakerySub: 'bread',
      image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviewsCount: 165,
      inStock: true,
      description: 'Freshly baked soft white sandwich bread with golden crust, baked daily.'
    },
    {
      id: 'prod-brown-bread',
      name: 'Brown Bread',
      unit: '400 g',
      price: 90,
      category: 'Bakery',
      bakerySub: 'bread',
      image: '/bakery/brown_bread.png',
      rating: 4.9,
      reviewsCount: 140,
      inStock: true,
      description: '100% whole wheat high-fiber healthy brown bread for wholesome morning toast.'
    },
    {
      id: 'prod-croissant',
      name: 'Croissant',
      unit: '1 piece',
      price: 70,
      category: 'Bakery',
      bakerySub: 'croissants',
      image: '/bakery/croissant.png',
      rating: 4.8,
      reviewsCount: 88,
      inStock: true,
      description: 'Flaky, buttery, European-style golden crescent pastry baked to crispy perfection.'
    },
    {
      id: 'prod-chocolate-muffin',
      name: 'Chocolate Muffin',
      unit: '1 piece',
      price: 60,
      category: 'Bakery',
      bakerySub: 'cakes',
      image: '/bakery/chocolate_muffin.png',
      rating: 4.9,
      reviewsCount: 195,
      inStock: true,
      description: 'Decadent moist chocolate sponge muffin loaded with rich melted chocolate chips.'
    },
    {
      id: 'prod-marie-biscuits',
      name: 'Marie Biscuits',
      unit: '200 g',
      price: 50,
      category: 'Bakery',
      bakerySub: 'biscuits',
      image: '/bakery/marie_biscuits.png',
      rating: 4.8,
      reviewsCount: 220,
      inStock: true,
      description: 'Classic light and crispy tea biscuits, perfect companion for morning and evening chai.'
    },
    {
      id: 'prod-corn-flakes',
      name: 'Corn Flakes',
      unit: '250 g',
      price: 180,
      category: 'Bakery',
      bakerySub: 'cereals',
      image: '/bakery/corn_flakes.png',
      rating: 4.9,
      reviewsCount: 130,
      inStock: true,
      description: 'Golden sun-ripened corn flakes loaded with essential iron and vitamins B & C.'
    },
    {
      id: 'prod-crispy-rusk',
      name: 'Crispy Wheat Rusk',
      unit: '300 g',
      price: 85,
      category: 'Bakery',
      bakerySub: 'rusk',
      image: '/bakery/rusk_circle.png',
      rating: 4.7,
      reviewsCount: 75,
      inStock: true,
      description: 'Twice-baked aromatic crispy elaichi wheat toast rusk for dipping in hot tea.'
    },
    {
      id: 'prod-kissan-jam',
      name: 'Mixed Fruit Jam',
      unit: '500 g',
      price: 175,
      originalPrice: 190,
      discountPercentage: 8,
      category: 'Bakery',
      bakerySub: 'spreads',
      image: '/categories/sauces.png',
      rating: 4.8,
      reviewsCount: 92,
      inStock: true,
      description: 'Delicious spread made from real pulpy fruits, sweet and tangy on fresh toast.'
    }
  ];

  // Combine mock products with catalog Bakery products
  const combinedBakeryProducts = [...bakeryProducts];
  products
    .filter(p => p.category === 'Bakery' && !combinedBakeryProducts.some(m => m.id === p.id))
    .forEach(p => combinedBakeryProducts.push({ ...p, bakerySub: 'other' }));

  // Filtering & Sorting
  const filteredProducts = combinedBakeryProducts
    .filter(p => {
      if (activeSubCat !== 'all' && p.bakerySub !== activeSubCat) return false;
      if (filterDiscountOnly && !p.discountPercentage) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.bakerySub?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'discount') return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      return 0; // featured default
    });

  const activeCategoryTitle =
    activeSubCat === 'all'
      ? 'All Products'
      : sidebarItems.find(s => s.key === activeSubCat)?.label || 'Bakery & Breakfast';

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col pb-24">
      {/* 1. TOP HEADER (Native, no fake status bar) */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-700 flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Aone Kirana</h2>
              <p className="text-[10px] text-slate-500 font-medium -mt-0.5">Fresh Grocery, Fast Delivery</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const el = document.getElementById('bakery-search-input');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus();
              }
            }}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200/80 active:scale-95 transition"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200/80 active:scale-95 transition"
            aria-label="Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. HERO BANNER - Warm Golden Toast Morning Banner */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-100/90 via-orange-50 to-amber-100 border border-amber-200/80 shadow-sm p-4 flex items-center justify-between min-h-[140px]">
          {/* Left Text */}
          <div className="max-w-[62%] z-10">
            <h1 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight leading-tight">
              Bakery & Breakfast
            </h1>
            <p className="text-xs text-amber-900/80 font-medium mt-1 leading-snug">
              Freshly baked, tasty and perfect for every morning
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3">
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-amber-200/60 shadow-xs">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Leaf className="w-2.5 h-2.5" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">Freshly Baked</span>
              </div>
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-amber-200/60 shadow-xs">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-2.5 h-2.5" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">Quality Products</span>
              </div>
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-amber-200/60 shadow-xs">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Truck className="w-2.5 h-2.5" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">Fast Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Image Banner Illustration */}
          <div className="absolute right-0 top-0 bottom-0 w-[42%] flex items-center justify-end pointer-events-none">
            <img
              src="/bakery/hero_illustration.png"
              alt="Bakery & Breakfast Illustration"
              className="h-full w-auto object-cover object-left"
              onError={e => {
                (e.target as HTMLImageElement).src = '/bakery/hero_bakery.png';
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. SUBCATEGORY CIRCLES BAR (Sticky Sub-Navbar) */}
      <div className="sticky top-[61px] z-30 bg-white/95 backdrop-blur-md py-2.5 px-3 border-b border-slate-100/90 shadow-2xs transition-all">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {subCategoryCircles.map(item => {
            const isSelected = activeSubCat === item.key;
            return (
              <button
                key={item.label}
                onClick={() => setActiveSubCat(item.key)}
                className="flex flex-col items-center flex-shrink-0 group focus:outline-none"
              >
                <div
                  className={`w-13 h-13 rounded-full flex items-center justify-center p-0.5 transition-all ${
                    isSelected
                      ? 'ring-2 ring-brand-700 ring-offset-1 bg-emerald-50 scale-105'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  {item.isAll ? (
                    <div className="w-11 h-11 rounded-full bg-emerald-100/90 border border-emerald-300 text-brand-700 flex items-center justify-center shadow-xs">
                      <div className="grid grid-cols-2 gap-1 p-1">
                        <div className="w-2 h-2 rounded-[2px] bg-brand-700" />
                        <div className="w-2 h-2 rounded-[2px] bg-brand-700" />
                        <div className="w-2 h-2 rounded-[2px] bg-brand-700" />
                        <div className="w-2 h-2 rounded-[2px] bg-brand-700" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center p-0.5">
                      <img
                        src={item.img}
                        alt={item.label}
                        className="w-full h-full object-cover rounded-full group-hover:scale-110 transition duration-300"
                      />
                    </div>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 text-center font-medium max-w-[58px] leading-tight ${
                    isSelected ? 'text-brand-700 font-bold' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. SEARCH, FILTER & SORT BAR */}
      <div className="px-3 py-2 bg-white border-b border-slate-100 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="bakery-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search bakery & breakfast..."
            className="w-full bg-slate-100/90 text-xs pl-9 pr-7 py-2 rounded-xl border border-transparent focus:border-brand-700 focus:bg-white focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Toggle */}
        <button
          onClick={() => setFilterDiscountOnly(!filterDiscountOnly)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
            filterDiscountOnly
              ? 'bg-brand-700 text-white border-brand-700 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>

        {/* Sort Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort</span>
          </button>

          {isSortOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40">
              <button
                onClick={() => {
                  setSortBy('featured');
                  setIsSortOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${
                  sortBy === 'featured' ? 'text-brand-700 font-bold bg-emerald-50' : 'text-slate-700'
                }`}
              >
                Featured
              </button>
              <button
                onClick={() => {
                  setSortBy('price-asc');
                  setIsSortOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${
                  sortBy === 'price-asc' ? 'text-brand-700 font-bold bg-emerald-50' : 'text-slate-700'
                }`}
              >
                Price: Low to High
              </button>
              <button
                onClick={() => {
                  setSortBy('price-desc');
                  setIsSortOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${
                  sortBy === 'price-desc' ? 'text-brand-700 font-bold bg-emerald-50' : 'text-slate-700'
                }`}
              >
                Price: High to Low
              </button>
              <button
                onClick={() => {
                  setSortBy('discount');
                  setIsSortOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${
                  sortBy === 'discount' ? 'text-brand-700 font-bold bg-emerald-50' : 'text-slate-700'
                }`}
              >
                Best Discount
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. MAIN CONTENT: FULL-WIDTH PRODUCT CATALOG */}
      <main className="flex-1 p-3 sm:p-4">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-bold text-slate-800">
              {activeCategoryTitle}{' '}
              <span className="text-slate-400 font-normal">
                ({filteredProducts.length > 0 ? `${filteredProducts.length}+` : '0'})
              </span>
            </h2>
            {filterDiscountOnly && (
              <span className="text-[10px] font-bold text-brand-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Offers only
              </span>
            )}
          </div>

          {/* 2*2 Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 my-4">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No bakery products found</p>
              <p className="text-[11px] text-slate-400 mt-1">Try resetting your search or filter</p>
              <button
                onClick={() => {
                  setActiveSubCat('all');
                  setSearchQuery('');
                  setFilterDiscountOnly(false);
                }}
                className="mt-3 px-3 py-1.5 bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                View All Bakery
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map(product => {
                const qty = getItemQuantity(product.id);
                const wishlisted = isWishlisted(product.id);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-2.5 flex flex-col justify-between hover:shadow-md transition-all relative group"
                  >
                    {/* Top Row: Discount Badge & Wishlist Heart */}
                    <div className="flex items-center justify-between w-full mb-1">
                      {product.discountPercentage ? (
                        <span className="bg-accent-red text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                          {product.discountPercentage}% OFF
                        </span>
                      ) : (
                        <div />
                      )}

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center transition ml-auto"
                        aria-label="Wishlist"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            wishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Product Image */}
                    <div
                      onClick={() => onOpenProductDetails?.(product)}
                      className="cursor-pointer flex items-center justify-center h-28 my-1 overflow-hidden"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                        onError={e => {
                          (e.target as HTMLImageElement).src = '/categories/bakery.png';
                        }}
                      />
                    </div>

                    {/* Product Information */}
                    <div className="mt-1">
                      <h3
                        onClick={() => onOpenProductDetails?.(product)}
                        className="text-xs font-bold text-slate-800 line-clamp-1 hover:text-brand-700 cursor-pointer"
                        title={product.name}
                      >
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">({product.unit})</p>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xs font-black text-slate-900">
                          Rs. {product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            Rs. {product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart or Stepper Controls */}
                    <div className="mt-2.5">
                      {qty === 0 ? (
                        <button
                          onClick={() => addToCart(product)}
                          className="w-full py-1.5 px-2 bg-white hover:bg-emerald-50 active:scale-95 text-brand-700 border border-brand-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-brand-700" />
                          <span>Add</span>
                          <Plus className="w-3 h-3 text-brand-700" />
                        </button>
                      ) : (
                        <div className="w-full py-1 px-1.5 bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
                          <button
                            onClick={() => updateQuantity(product.id, qty - 1)}
                            className="w-5 h-5 rounded-md hover:bg-brand-800 flex items-center justify-center transition active:scale-90"
                          >
                            <Minus className="w-3 h-3 text-white" />
                          </button>
                          <span className="text-xs font-black">{qty}</span>
                          <button
                            onClick={() => updateQuantity(product.id, qty + 1)}
                            className="w-5 h-5 rounded-md hover:bg-brand-800 flex items-center justify-center transition active:scale-90"
                          >
                            <Plus className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
    </div>
  );
};
