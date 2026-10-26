import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  ShoppingCart,
  Leaf,
  Snowflake,
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

interface DairyEggsPageProps {
  onBack: () => void;
  onOpenProductDetails?: (product: Product) => void;
}

type DairySubCategoryKey =
  | 'all'
  | 'milk'
  | 'eggs'
  | 'cheese'
  | 'butter'
  | 'yogurt'
  | 'paneer'
  | 'flavored'
  | 'other';

export const DairyEggsPage: React.FC<DairyEggsPageProps> = ({
  onBack,
  onOpenProductDetails
}) => {
  const { totalItems, setIsCartOpen, addToCart, updateQuantity, getItemQuantity } = useCart();
  const { products } = useOrders();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [activeSubCat, setActiveSubCat] = useState<DairySubCategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [filterDiscountOnly, setFilterDiscountOnly] = useState(false);

  // Subcategory circles matching media_1790473970647.png
  const subCategoryCircles = [
    { key: 'all' as DairySubCategoryKey, label: 'All', isAll: true },
    { key: 'milk' as DairySubCategoryKey, label: 'Milk', img: '/dairy/milk_circle.png' },
    { key: 'eggs' as DairySubCategoryKey, label: 'Eggs', img: '/dairy/eggs_circle.png' },
    { key: 'cheese' as DairySubCategoryKey, label: 'Cheese', img: '/dairy/cheese_circle.png' },
    { key: 'butter' as DairySubCategoryKey, label: 'Butter & Margarine', img: '/dairy/butter_circle.png' },
    { key: 'yogurt' as DairySubCategoryKey, label: 'Yogurt & Curd', img: '/dairy/yogurt_circle.png' },
    { key: 'paneer' as DairySubCategoryKey, label: 'Paneer', img: '/dairy/paneer_circle.png' },
  ];

  // Left sidebar menu items
  const sidebarItems: { key: DairySubCategoryKey; label: string }[] = [
    { key: 'all', label: 'All Products' },
    { key: 'milk', label: 'Milk' },
    { key: 'eggs', label: 'Eggs' },
    { key: 'cheese', label: 'Cheese' },
    { key: 'butter', label: 'Butter & Margarine' },
    { key: 'yogurt', label: 'Yogurt & Curd' },
    { key: 'paneer', label: 'Paneer' },
    { key: 'flavored', label: 'Flavored Milk' },
    { key: 'other', label: 'Other Dairy' },
  ];

  // Exact 6 products from media_1790473970647.png
  const dairyProducts: (Product & { dairySub: DairySubCategoryKey })[] = [
    {
      id: 'prod-amul-taaza',
      name: 'Amul Taaza Milk',
      unit: '1 L',
      price: 110,
      originalPrice: 122,
      discountPercentage: 10,
      category: 'Dairy',
      dairySub: 'milk',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewsCount: 180,
      inStock: true,
      description: 'Homogenised toned milk, rich in calcium and vitamins, perfectly pasteurized.'
    },
    {
      id: 'prod-nestle-fresh-milk',
      name: 'Nestle Fresh Milk',
      unit: '1 L',
      price: 120,
      category: 'Dairy',
      dairySub: 'milk',
      image: '/dairy/nestle_milk.png',
      rating: 4.8,
      reviewsCount: 112,
      inStock: true,
      description: 'Pure, fresh, high quality daily milk packaged under strict hygienic standards.'
    },
    {
      id: 'prod-local-eggs',
      name: 'Local Eggs',
      unit: '10 pieces',
      price: 160,
      category: 'Dairy',
      dairySub: 'eggs',
      image: '/dairy/local_eggs.png',
      rating: 4.9,
      reviewsCount: 245,
      inStock: true,
      description: 'Farm fresh brown local country eggs, high in protein and natural nutrients.'
    },
    {
      id: 'prod-amul-butter',
      name: 'Amul Butter',
      unit: '100 g',
      price: 120,
      category: 'Dairy',
      dairySub: 'butter',
      image: '/dairy/amul_butter.png',
      rating: 4.9,
      reviewsCount: 310,
      inStock: true,
      description: 'Utterly butterly delicious pure salted butter from fresh dairy cream.'
    },
    {
      id: 'prod-dahi-curd',
      name: 'Dahi (Curd)',
      unit: '400 g',
      price: 70,
      category: 'Dairy',
      dairySub: 'yogurt',
      image: '/dairy/dahi_curd.png',
      rating: 4.8,
      reviewsCount: 95,
      inStock: true,
      description: 'Thick, creamy, naturally fermented probiotic dahi for refreshing daily meals.'
    },
    {
      id: 'prod-fresh-paneer',
      name: 'Fresh Paneer',
      unit: '200 g',
      price: 120,
      category: 'Dairy',
      dairySub: 'paneer',
      image: '/dairy/fresh_paneer.png',
      rating: 4.8,
      reviewsCount: 135,
      inStock: true,
      description: 'Soft, succulent, protein-packed fresh cottage cheese, perfect for curries and tikka.'
    },
    {
      id: 'prod-britannia-cheese',
      name: 'Britannia Cheese Slices',
      unit: '200 g',
      price: 210,
      originalPrice: 230,
      discountPercentage: 9,
      category: 'Dairy',
      dairySub: 'cheese',
      image: '/dairy/cheese_circle.png',
      rating: 4.7,
      reviewsCount: 68,
      inStock: true,
      description: 'Processed cheddar cheese slices, ideal for sandwiches, burgers, and toast.'
    },
    {
      id: 'prod-amul-kool-flavored',
      name: 'Amul Kool Kesar Milk',
      unit: '200 ml',
      price: 50,
      category: 'Dairy',
      dairySub: 'flavored',
      image: '/categories/beverages.png',
      rating: 4.8,
      reviewsCount: 42,
      inStock: true,
      description: 'Chilled saffron flavored sterilized milk beverage, refreshing and energetic.'
    }
  ];

  // Combine mock products with catalog Dairy & Eggs products
  const combinedDairyProducts = [...dairyProducts];
  products
    .filter(p => p.category === 'Dairy' && !combinedDairyProducts.some(m => m.id === p.id))
    .forEach(p => combinedDairyProducts.push({ ...p, dairySub: 'other' }));

  // Filtering & Sorting
  const filteredProducts = combinedDairyProducts
    .filter(p => {
      if (activeSubCat !== 'all' && p.dairySub !== activeSubCat) return false;
      if (filterDiscountOnly && !p.discountPercentage) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.dairySub?.toLowerCase().includes(q)
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
      : sidebarItems.find(s => s.key === activeSubCat)?.label || 'Dairy & Eggs';

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
              const el = document.getElementById('dairy-search-input');
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

      {/* 2. HERO BANNER - Soft Sky Blue Banner */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-sky-100/90 via-blue-50 to-sky-100 border border-sky-200/80 shadow-sm p-4 flex items-center justify-between min-h-[140px]">
          {/* Left Text */}
          <div className="max-w-[62%] z-10">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Dairy & Eggs
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-1 leading-snug">
              Fresh, nutritious and essential for your family
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3">
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-sky-200/60 shadow-xs">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Leaf className="w-2.5 h-2.5" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">Fresh Products</span>
              </div>
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-sky-200/60 shadow-xs">
                <div className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center">
                  <Snowflake className="w-2.5 h-2.5" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">Properly Stored</span>
              </div>
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-sky-200/60 shadow-xs">
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
              src="/dairy/hero_illustration.png"
              alt="Dairy and Eggs Illustration"
              className="h-full w-auto object-cover object-left"
              onError={e => {
                (e.target as HTMLImageElement).src = '/dairy/hero_dairy.png';
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
            id="dairy-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search dairy & eggs..."
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
              <p className="text-xs font-bold text-slate-700">No dairy products found</p>
              <p className="text-[11px] text-slate-400 mt-1">Try resetting your search or filter</p>
              <button
                onClick={() => {
                  setActiveSubCat('all');
                  setSearchQuery('');
                  setFilterDiscountOnly(false);
                }}
                className="mt-3 px-3 py-1.5 bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                View All Dairy
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
                          (e.target as HTMLImageElement).src = '/categories/dairy.png';
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
