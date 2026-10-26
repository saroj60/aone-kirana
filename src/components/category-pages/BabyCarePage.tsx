import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
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

interface BabyCarePageProps {
  onBack: () => void;
  onOpenProductDetails?: (product: Product) => void;
}

type BabyCareSubCategoryKey =
  | 'all'
  | 'diapers'
  | 'wipes'
  | 'bath'
  | 'formula'
  | 'feeding'
  | 'hygiene'
  | 'toys'
  | 'maternity'
  | 'other';

export const BabyCarePage: React.FC<BabyCarePageProps> = ({
  onBack,
  onOpenProductDetails
}) => {
  const { totalItems, setIsCartOpen, addToCart, updateQuantity, getItemQuantity } = useCart();
  const { products } = useOrders();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [activeSubCat, setActiveSubCat] = useState<BabyCareSubCategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [filterDiscountOnly, setFilterDiscountOnly] = useState(false);

  // Subcategory story circles matching media_1790475398260.png
  const subCategoryCircles = [
    { key: 'all' as BabyCareSubCategoryKey, label: 'All', img: '/baby/story_all.png' },
    { key: 'diapers' as BabyCareSubCategoryKey, label: 'Diapers', img: '/baby/story_diapers.png' },
    { key: 'wipes' as BabyCareSubCategoryKey, label: 'Baby Wipes', img: '/baby/story_wipes.png' },
    { key: 'bath' as BabyCareSubCategoryKey, label: 'Bath & Skin Care', img: '/baby/story_bath.png' },
    { key: 'formula' as BabyCareSubCategoryKey, label: 'Baby Food & Formula', img: '/baby/story_formula.png' },
    { key: 'feeding' as BabyCareSubCategoryKey, label: 'Feeding Accessories', img: '/baby/story_feeding.png' },
    { key: 'toys' as BabyCareSubCategoryKey, label: 'Baby Toys', img: '/baby/story_toys.png' },
  ];

  // Left sidebar menu items matching media_1790475398260.png
  const sidebarItems: { key: BabyCareSubCategoryKey; label: string }[] = [
    { key: 'all', label: 'All Products' },
    { key: 'diapers', label: 'Diapers' },
    { key: 'wipes', label: 'Baby Wipes' },
    { key: 'bath', label: 'Bath & Skin Care' },
    { key: 'formula', label: 'Baby Food & Formula' },
    { key: 'feeding', label: 'Feeding Accessories' },
    { key: 'hygiene', label: 'Baby Health & Hygiene' },
    { key: 'toys', label: 'Baby Toys' },
    { key: 'maternity', label: 'Maternity Care' },
    { key: 'other', label: 'Other Baby Care' },
  ];

  // Exact 6 products from media_1790475398260.png
  const babyCareProducts: (Product & { babySub: BabyCareSubCategoryKey })[] = [
    {
      id: 'prod-pampers-diapers',
      name: 'Pampers Baby Diapers',
      unit: 'M, 64 pcs',
      price: 1250,
      originalPrice: 1390,
      discountPercentage: 10,
      category: 'BabyCare',
      babySub: 'diapers',
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewsCount: 340,
      inStock: true,
      description: 'Ultra absorbent diapers with aloe vera lotion and magic gel channels for up to 12 hours of dry nights.'
    },
    {
      id: 'prod-johnsons-lotion',
      name: "Johnson's Baby Lotion",
      unit: '200 ml',
      price: 350,
      category: 'BabyCare',
      babySub: 'bath',
      image: '/baby/johnsons_lotion.png',
      rating: 4.8,
      reviewsCount: 220,
      inStock: true,
      description: 'Clinically proven mild formula with coconut oil keeps delicate newborn skin soft and moisturized for 24 hours.'
    },
    {
      id: 'prod-huggies-wipes',
      name: 'Huggies Baby Wipes',
      unit: '72 pcs',
      price: 250,
      category: 'BabyCare',
      babySub: 'wipes',
      image: '/baby/huggies_wipes.png',
      rating: 4.8,
      reviewsCount: 195,
      inStock: true,
      description: 'Triple clean technology with 99% pure water and natural fibers, safe for sensitive newborn face and hands.'
    },
    {
      id: 'prod-cetaphil-baby-wash',
      name: 'Cetaphil Baby Wash',
      unit: '400 ml',
      price: 650,
      category: 'BabyCare',
      babySub: 'bath',
      image: '/baby/cetaphil_wash.png',
      rating: 4.9,
      reviewsCount: 180,
      inStock: true,
      description: 'Tear-free daily wash with organic calendula and chamomile to gently cleanse hair and skin without drying.'
    },
    {
      id: 'prod-nan-stage-3',
      name: 'NAN Stage 3',
      unit: '400 g',
      price: 1450,
      category: 'BabyCare',
      babySub: 'formula',
      image: '/baby/nan_formula.png',
      rating: 4.9,
      reviewsCount: 260,
      inStock: true,
      description: 'Nestle Optipro Stage 3 follow-up formula fortified with DHA, ARA, and essential vitamins for growing toddlers.'
    },
    {
      id: 'prod-philips-avent-bottle',
      name: 'Philips Avent Feeding Bottle',
      unit: '260 ml',
      price: 890,
      category: 'BabyCare',
      babySub: 'feeding',
      image: '/baby/avent_bottles.png',
      rating: 4.9,
      reviewsCount: 215,
      inStock: true,
      description: 'Natural response teat with anti-colic valve designed to reduce air ingestion and colic during feeding.'
    }
  ];

  // Combine mock products with catalog BabyCare products
  const combinedBabyCareProducts = [...babyCareProducts];
  products
    .filter(p => p.category === 'BabyCare' && !combinedBabyCareProducts.some(m => m.id === p.id))
    .forEach(p => combinedBabyCareProducts.push({ ...p, babySub: 'other' }));

  // Filtering products
  let filteredProducts = combinedBabyCareProducts.filter(item => {
    const matchesSub = activeSubCat === 'all' || item.babySub === activeSubCat;
    if (!matchesSub) return false;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.unit.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.babySub && item.babySub.toLowerCase().includes(q));
    const matchesDiscount = !filterDiscountOnly || (item.discountPercentage && item.discountPercentage > 0);
    return matchesSearch && matchesDiscount;
  });

  // Sorting products
  if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'discount') {
    filteredProducts.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100 px-3 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Logo with Green Cart & Subtitle */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-emerald-700 leading-none">
                Aone Kirana
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">
                Fresh Grocery, Fast Delivery
              </p>
            </div>
          </div>
        </div>

        {/* Right Search & Cart Icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const el = document.getElementById('baby-search-input');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus();
              }
            }}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition"
            aria-label="View Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-3 pt-3 space-y-3">
        {/* Exact Hero Section matching media_1790475398260.png */}
        <div className="rounded-2xl overflow-hidden shadow-xs border border-pink-100 bg-[#fdeff4]">
          <img
            src="/baby/hero_banner.png"
            alt="Baby Care - Gentle care for your little one"
            className="w-full h-auto object-cover block"
          />
        </div>

        {/* Story Circle Badges (Sticky Sub-Navbar) */}
        <div className="sticky top-[56px] z-20 bg-white/95 backdrop-blur-md px-3 py-2 border-b border-slate-100/90 shadow-2xs overflow-x-auto no-scrollbar transition-all">
          <div className="flex items-center gap-3 px-1 min-w-max">
            {subCategoryCircles.map(item => {
              const isActive = activeSubCat === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveSubCat(item.key)}
                  className="flex flex-col items-center gap-1.5 focus:outline-hidden group cursor-pointer"
                >
                  <div
                    className={`w-14 h-14 rounded-full p-0.5 flex items-center justify-center transition-all ${
                      isActive
                        ? 'ring-2 ring-emerald-500 ring-offset-2 scale-105'
                        : 'border border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 flex items-center justify-center">
                      <img
                        src={item.img}
                        alt={item.label}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                      />
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-semibold text-center max-w-[65px] leading-tight ${
                      isActive ? 'text-emerald-700 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar + Filters + Sort */}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="baby-search-input"
              type="text"
              placeholder="Search baby care products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
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

          {/* Filters Button */}
          <button
            onClick={() => setFilterDiscountOnly(!filterDiscountOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition shadow-2xs ${
              filterDiscountOnly
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters</span>
          </button>

          {/* Sort Button */}
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Sort</span>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs">
                <button
                  onClick={() => {
                    setSortBy('featured');
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 font-medium ${
                    sortBy === 'featured' ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  Featured
                </button>
                <button
                  onClick={() => {
                    setSortBy('price-asc');
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 font-medium ${
                    sortBy === 'price-asc' ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  Price: Low to High
                </button>
                <button
                  onClick={() => {
                    setSortBy('price-desc');
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 font-medium ${
                    sortBy === 'price-desc' ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  Price: High to Low
                </button>
                <button
                  onClick={() => {
                    setSortBy('discount');
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 font-medium ${
                    sortBy === 'discount' ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  Highest Discount
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Section: Full-width Products Grid */}
        <div className="space-y-2 pt-2">
          {/* Product Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-extrabold text-slate-800">
                {activeSubCat === 'all'
                  ? 'All Products (120+)'
                  : sidebarItems.find(s => s.key === activeSubCat)?.label || 'Products'}
              </h3>
              <span className="text-[11px] font-medium text-slate-500">
                {filteredProducts.length} items
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                <p className="text-xs font-semibold text-slate-600">No baby care products found.</p>
                <button
                  onClick={() => {
                    setActiveSubCat('all');
                    setSearchQuery('');
                    setFilterDiscountOnly(false);
                  }}
                  className="mt-2 text-xs font-bold text-emerald-600 underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map(product => {
                  const qty = getItemQuantity(product.id);
                  const isFav = isWishlisted(product.id);

                  return (
                    <div
                      key={product.id}
                      className="bg-white border border-slate-200/90 rounded-xl p-2 flex flex-col justify-between hover:shadow-md transition relative group"
                    >
                      {/* Top Badges: Discount & Heart */}
                      <div className="flex items-start justify-between mb-1">
                        {product.discountPercentage ? (
                          <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-2xs">
                            {product.discountPercentage}% OFF
                          </span>
                        ) : (
                          <span></span>
                        )}

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition ml-auto"
                          aria-label="Wishlist"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isFav ? 'fill-red-500 text-red-500' : 'text-slate-400'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Product Image */}
                      <div
                        onClick={() => onOpenProductDetails?.(product)}
                        className="h-24 w-full flex items-center justify-center p-1 cursor-pointer overflow-hidden"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-200"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="mt-1">
                        <h4
                          onClick={() => onOpenProductDetails?.(product)}
                          className="text-[11px] font-bold text-slate-800 leading-snug line-clamp-1 cursor-pointer hover:text-emerald-700"
                        >
                          {product.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium leading-tight">
                          ({product.unit})
                        </p>

                        {/* Pricing */}
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xs font-black text-slate-900">
                            Rs. {product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[10px] text-slate-400 line-through">
                              Rs. {product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add to Cart / Quantity Selector Button */}
                      <div className="mt-2">
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(product)}
                            className="w-full py-1.5 px-2 rounded-lg border border-emerald-500 hover:bg-emerald-500 hover:text-white text-emerald-600 text-[11px] font-bold flex items-center justify-center gap-1 transition shadow-2xs active:scale-95"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Add</span>
                            <span className="text-xs">+</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-emerald-600 text-white rounded-lg px-2 py-1 shadow-2xs">
                            <button
                              onClick={() => updateQuantity(product.id, qty - 1)}
                              className="p-0.5 hover:bg-emerald-700 rounded transition"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black px-1.5">{qty}</span>
                            <button
                              onClick={() => updateQuantity(product.id, qty + 1)}
                              className="p-0.5 hover:bg-emerald-700 rounded transition"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
