import React, { useState } from 'react';
import { ArrowLeft, Search, ShoppingBag, ShoppingCart, Leaf, ShieldCheck, Truck, ChevronRight, ArrowUpDown, Heart, Plus, Minus, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { useWishlist } from '../../context/WishlistContext';
import { Product } from '../../data/mockData';

interface FruitsVegetablesPageProps {
  onBack: () => void;
  onOpenProductDetails?: (product: Product) => void;
}

type SubCategoryKey = 'all' | 'fruits' | 'leafy' | 'root' | 'salad' | 'herbs' | 'exotic' | 'fresh-cuts';

export const FruitsVegetablesPage: React.FC<FruitsVegetablesPageProps> = ({
  onBack,
  onOpenProductDetails
}) => {
  const { totalItems, setIsCartOpen, addToCart, updateQuantity, getItemQuantity } = useCart();
  const { products } = useOrders();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [activeSubCat, setActiveSubCat] = useState<SubCategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Subcategory circles
  const subCategoryCircles: { key: SubCategoryKey; label: string; icon: string; isAll?: boolean }[] = [
    { key: 'all', label: 'All', icon: '', isAll: true },
    { key: 'fruits', label: 'Fruits', icon: '🍌' },
    { key: 'leafy', label: 'Leafy Vegetables', icon: '🥬' },
    { key: 'root', label: 'Root Vegetables', icon: '🥕' },
    { key: 'exotic', label: 'Exotic Fruits', icon: '🥑' },
    { key: 'salad', label: 'Salad Items', icon: '🥗' },
    { key: 'fresh-cuts', label: 'Fresh Cuts', icon: '🍉' },
  ];

  // Left sidebar menu items
  const sidebarItems: { key: SubCategoryKey; label: string }[] = [
    { key: 'all', label: 'All Products' },
    { key: 'fruits', label: 'Fruits' },
    { key: 'leafy', label: 'Leafy Vegetables' },
    { key: 'root', label: 'Root Vegetables' },
    { key: 'salad', label: 'Salad Items' },
    { key: 'herbs', label: 'Herbs & Spices' },
    { key: 'exotic', label: 'Exotic Fruits' },
    { key: 'fresh-cuts', label: 'Fresh Cuts' },
  ];

  // Filter only Vegetables & Fruits
  const vegFruitProducts = products.filter(
    p => p.category === 'Vegetables' || p.category === 'Fruits'
  );

  // Filter by subcategory and search query
  const filteredProducts = vegFruitProducts.filter(p => {
    if (activeSubCat !== 'all' && p.subCategory !== activeSubCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'discount') return (b.discountPercentage || 0) - (a.discountPercentage || 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-white pb-24 font-sans animate-fadeIn">
      {/* 1. TOP HEADER matching media_1790472471159.png */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between gap-3">
        {/* Back Arrow & Brand */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition active:scale-90"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center text-white shadow-2xs">
              <ShoppingBag className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                <span>Aone</span> <span className="text-brand-700">Kirana</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Fresh Grocery, Fast Delivery</p>
            </div>
          </div>
        </div>

        {/* Search & Cart Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const el = document.getElementById('fruits-veg-search-input');
              if (el) {
                el.focus();
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition active:scale-95"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-slate-700" />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700"
          >
            <ShoppingCart className="w-5 h-5 text-slate-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-red text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Instant Search Bar */}
      <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center gap-2 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="fruits-veg-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search fruits & vegetables (e.g. apple, potato, banana)..."
            className="w-full bg-slate-100/90 text-xs pl-9 pr-8 py-2 rounded-xl border border-transparent focus:border-brand-700 focus:bg-white focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. HERO CATEGORY BANNER matching mockup */}
      <div className="px-4 py-2.5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-green-50 to-lime-50/60 border border-emerald-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="z-10 max-w-[62%] sm:max-w-[65%]">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
              <span className="text-brand-700 block">Fresh</span>
              <span>Vegetables & Fruits</span>
            </h2>
            <p className="text-[11px] text-slate-600 font-medium mt-1 leading-tight">
              Farm fresh, healthy and natural goodness for your family
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-[10px] font-bold text-slate-700">
              <div className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <Leaf className="w-3 h-3 text-emerald-600" />
                <span>Farm Fresh Produce</span>
              </div>
              <div className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Quality Assured</span>
              </div>
              <div className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <Truck className="w-3 h-3 text-emerald-600" />
                <span>Fast Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Wicker Basket with Veggies */}
          <div className="w-32 sm:w-44 h-28 sm:h-36 relative flex-shrink-0 flex items-center justify-end">
            <img
              src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&auto=format&fit=crop&q=80"
              alt="Fresh vegetables in basket"
              className="w-full h-full object-contain filter drop-shadow-md transform hover:scale-105 transition"
            />
          </div>
        </div>
      </div>

      {/* 3. HORIZONTAL SUBCATEGORY CIRCULAR STORIES BAR (Sticky Sub-Navbar) */}
      <div className="sticky top-[61px] z-30 bg-white/95 backdrop-blur-md px-4 py-2 border-b border-slate-100/90 shadow-2xs overflow-x-auto no-scrollbar transition-all">
        <div className="flex items-center gap-4 min-w-max pb-1">
          {subCategoryCircles.map(item => {
            const isActive = activeSubCat === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSubCat(item.key)}
                className="flex flex-col items-center group text-center focus:outline-none"
              >
                {/* Circle Icon Container */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    item.isAll
                      ? isActive
                        ? 'bg-brand-700 text-white shadow-sm ring-2 ring-brand-300'
                        : 'bg-emerald-50 text-brand-700'
                      : isActive
                      ? 'bg-brand-100 ring-2 ring-brand-600 shadow-sm'
                      : 'bg-slate-50 border border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  {item.isAll ? (
                    <div className="grid grid-cols-2 gap-1 p-1">
                      <div className="w-2 h-2 rounded-xs bg-current" />
                      <div className="w-2 h-2 rounded-xs bg-current" />
                      <div className="w-2 h-2 rounded-xs bg-current" />
                      <div className="w-2 h-2 rounded-xs bg-current" />
                    </div>
                  ) : (
                    <span className="text-xl">{item.icon}</span>
                  )}
                </div>

                <span
                  className={`mt-1.5 text-[10px] font-bold tracking-tight ${
                    isActive ? 'text-brand-700' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FULL-WIDTH PRODUCT CATALOG */}
      <div className="px-3 pt-3">
        <div className="w-full min-w-0">
          {/* Header Row: Title & Sort Button */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs sm:text-sm font-black text-slate-900">
              {sidebarItems.find(s => s.key === activeSubCat)?.label} ({sortedProducts.length}+)
            </h3>

            {/* Sort Button */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700"
              >
                <ArrowUpDown className="w-3 h-3 text-slate-500" />
                <span>Sort</span>
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 text-[11px] font-semibold space-y-0.5">
                  <button
                    onClick={() => { setSortBy('featured'); setIsSortOpen(false); }}
                    className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-50"
                  >
                    Featured
                  </button>
                  <button
                    onClick={() => { setSortBy('price-asc'); setIsSortOpen(false); }}
                    className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-50"
                  >
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => { setSortBy('price-desc'); setIsSortOpen(false); }}
                    className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-50"
                  >
                    Price: High to Low
                  </button>
                  <button
                    onClick={() => { setSortBy('discount'); setIsSortOpen(false); }}
                    className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-50"
                  >
                    Best Discount
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2*2 Product Grid */}
          <div className="grid grid-cols-2 gap-3">
            {sortedProducts.map(product => {
              const qty = getItemQuantity(product.id);
              const isLiked = isWishlisted(product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  {/* Top: Discount & Wishlist */}
                  <div className="flex items-center justify-between w-full mb-0.5">
                    {product.discountPercentage ? (
                      <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        {product.discountPercentage}% OFF
                      </span>
                    ) : (
                      <span />
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="w-6 h-6 rounded-full hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition ml-auto"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Centered Image */}
                  <div
                    onClick={() => onOpenProductDetails?.(product)}
                    className="w-full aspect-square flex items-center justify-center cursor-pointer overflow-hidden rounded-xl p-1 my-0.5"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Title & Unit */}
                  <div onClick={() => onOpenProductDetails?.(product)} className="cursor-pointer">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight truncate hover:text-brand-700">
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">({product.unit})</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-xs font-black text-slate-900">
                      Rs. {product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        Rs. {product.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Button: [Add +] or Stepper */}
                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full py-1.5 bg-white hover:bg-brand-50 border border-brand-700 text-brand-700 hover:text-brand-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition"
                    >
                      <ShoppingCart className="w-3 h-3 text-brand-700" />
                      <span>Add</span>
                      <span className="text-xs font-black">+</span>
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between bg-brand-700 text-white rounded-xl p-0.5 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-brand-800 active:scale-90 transition text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-extrabold px-1.5">{qty}</span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-brand-800 active:scale-90 transition text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {sortedProducts.length === 0 && (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200/80 p-6 my-4">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No items found matching "{searchQuery}"</p>
              <p className="text-xs text-slate-400 mt-1">Try another search term or clear the filter</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveSubCat('all'); }}
                className="mt-3 px-3.5 py-1.5 bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
