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

interface CookingEssentialsPageProps {
  onBack: () => void;
  onOpenProductDetails?: (product: Product) => void;
}

type CookingSubCategoryKey =
  | 'all'
  | 'oil'
  | 'spices'
  | 'salt-sugar'
  | 'sauces'
  | 'vinegar'
  | 'masala-mixes'
  | 'pickles'
  | 'other';

export const CookingEssentialsPage: React.FC<CookingEssentialsPageProps> = ({
  onBack,
  onOpenProductDetails
}) => {
  const { totalItems, setIsCartOpen, addToCart, updateQuantity, getItemQuantity } = useCart();
  const { products } = useOrders();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [activeSubCat, setActiveSubCat] = useState<CookingSubCategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [filterDiscountOnly, setFilterDiscountOnly] = useState(false);

  // Subcategory circles matching the screenshot
  const subCategoryCircles = [
    { key: 'all' as CookingSubCategoryKey, label: 'All', isAll: true },
    { key: 'oil' as CookingSubCategoryKey, label: 'Cooking Oil', img: '/cooking/oil_circle.png' },
    { key: 'spices' as CookingSubCategoryKey, label: 'Spices & Masala', img: '/cooking/spices_circle.png' },
    { key: 'salt-sugar' as CookingSubCategoryKey, label: 'Salt & Sugar', img: '/cooking/salt_circle.png' },
    { key: 'sauces' as CookingSubCategoryKey, label: 'Sauces & Condiments', img: '/cooking/sauces_circle.png' },
    { key: 'other' as CookingSubCategoryKey, label: 'Food Additives', img: '/cooking/additives_circle.png' },
    { key: 'masala-mixes' as CookingSubCategoryKey, label: 'Masala Mixes', img: '/cooking/masala_mixes_circle.png' },
  ];

  // Left sidebar menu items
  const sidebarItems: { key: CookingSubCategoryKey; label: string }[] = [
    { key: 'all', label: 'All Products' },
    { key: 'oil', label: 'Cooking Oil' },
    { key: 'spices', label: 'Spices & Masala' },
    { key: 'salt-sugar', label: 'Salt & Sugar' },
    { key: 'sauces', label: 'Sauces & Condiments' },
    { key: 'vinegar', label: 'Vinegar & Seasoning' },
    { key: 'masala-mixes', label: 'Masala Mixes' },
    { key: 'pickles', label: 'Pickles' },
    { key: 'other', label: 'Other Essentials' },
  ];

  // Exact 6 products from media_1790473684524.png
  const cookingProducts: (Product & { cookingSub: CookingSubCategoryKey })[] = [
    {
      id: 'prod-fortune-sunflower-oil',
      name: 'Fortune Sunflower Oil',
      unit: '1 L',
      price: 199,
      originalPrice: 220,
      discountPercentage: 10,
      category: 'Essentials',
      cookingSub: 'oil',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewsCount: 142,
      inStock: true,
      description: 'Refined sunflower cooking oil enriched with vitamins A & D, light and heart-friendly.'
    },
    {
      id: 'prod-everest-turmeric',
      name: 'Everest Turmeric Powder',
      unit: '200 g',
      price: 120,
      category: 'Essentials',
      cookingSub: 'spices',
      image: '/cooking/everest_turmeric.png',
      rating: 4.8,
      reviewsCount: 98,
      inStock: true,
      description: 'Aromatic pure golden turmeric powder with high natural curcumin content.'
    },
    {
      id: 'prod-mdh-chilli',
      name: 'MDH Red Chilli Powder',
      unit: '200 g',
      price: 140,
      category: 'Essentials',
      cookingSub: 'spices',
      image: '/cooking/mdh_chilli.png',
      rating: 4.9,
      reviewsCount: 115,
      inStock: true,
      description: 'Finely ground vibrant red chillies providing bold color and balanced heat.'
    },
    {
      id: 'prod-tata-salt',
      name: 'TATA Salt',
      unit: '1 kg',
      price: 60,
      category: 'Essentials',
      cookingSub: 'salt-sugar',
      image: '/cooking/tata_salt.png',
      rating: 4.9,
      reviewsCount: 230,
      inStock: true,
      description: 'Desh Ka Namak - vacuum evaporated iodized salt for pure taste and daily health.'
    },
    {
      id: 'prod-mithas-sugar',
      name: 'Mithas White Sugar',
      unit: '1 kg',
      price: 90,
      category: 'Essentials',
      cookingSub: 'salt-sugar',
      image: '/cooking/mithas_sugar.png',
      rating: 4.8,
      reviewsCount: 84,
      inStock: true,
      description: 'Premium sulfurless crystal white sugar, clean and quickly dissolving.'
    },
    {
      id: 'prod-aashirvaad-garam-masala',
      name: 'Aashirvaad Garam Masala',
      unit: '100 g',
      price: 110,
      category: 'Essentials',
      cookingSub: 'masala-mixes',
      image: '/cooking/aashirvaad_garam_masala.png',
      rating: 4.8,
      reviewsCount: 76,
      inStock: true,
      description: 'Traditional blend of roasted spices ground to perfection for authentic aromatic curry.'
    },
    {
      id: 'prod-dabur-mustard-oil',
      name: 'Dabur Mustard Oil (Kachi Ghani)',
      unit: '1 L',
      price: 240,
      originalPrice: 260,
      discountPercentage: 8,
      category: 'Essentials',
      cookingSub: 'oil',
      image: '/categories/cooking_oil.png',
      rating: 4.8,
      reviewsCount: 64,
      inStock: true,
      description: 'Cold pressed authentic pungent kachi ghani mustard oil for traditional Nepali recipes.'
    },
    {
      id: 'prod-everest-meat-masala',
      name: 'Everest Meat Masala',
      unit: '100 g',
      price: 95,
      category: 'Essentials',
      cookingSub: 'masala-mixes',
      image: '/cooking/masala_mixes_circle.png',
      rating: 4.7,
      reviewsCount: 52,
      inStock: true,
      description: 'Rich spice blend specially formulated for rich meat and chicken gravy dishes.'
    }
  ];

  // Merge mock products with catalog Essentials products
  const combinedCookingProducts = [...cookingProducts];
  products
    .filter(p => p.category === 'Essentials' && !combinedCookingProducts.some(m => m.id === p.id))
    .forEach(p => combinedCookingProducts.push({ ...p, cookingSub: 'other' }));

  // Filtering & Sorting
  const filteredProducts = combinedCookingProducts
    .filter(p => {
      if (activeSubCat !== 'all' && p.cookingSub !== activeSubCat) return false;
      if (filterDiscountOnly && !p.discountPercentage) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.cookingSub?.toLowerCase().includes(q)
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
      : sidebarItems.find(s => s.key === activeSubCat)?.label || 'Cooking Essentials';

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
              const el = document.getElementById('cooking-search-input');
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

      {/* 2. HERO BANNER - Soft Kitchen Spice Peach/Amber Banner */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-100/90 via-orange-50 to-amber-100 border border-amber-200/80 shadow-sm p-4 flex items-center justify-between min-h-[140px]">
          {/* Left Text */}
          <div className="max-w-[62%] z-10">
            <h1 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight leading-tight">
              Cooking Essentials
            </h1>
            <p className="text-xs text-amber-900/80 font-medium mt-1 leading-snug">
              Every ingredient for delicious meals
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3">
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-amber-200/60 shadow-xs">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Leaf className="w-2.5 h-2.5" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">Premium Quality</span>
              </div>
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-amber-200/60 shadow-xs">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-2.5 h-2.5" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">Trusted Brands</span>
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
              src="/cooking/hero_illustration.png"
              alt="Cooking Essentials Spices and Oil"
              className="h-full w-auto object-cover object-left"
              onError={e => {
                // Fallback to full banner if illustration not found
                (e.target as HTMLImageElement).src = '/cooking/hero_cooking.png';
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
            id="cooking-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search cooking essentials..."
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
              <p className="text-xs font-bold text-slate-700">No cooking essentials found</p>
              <p className="text-[11px] text-slate-400 mt-1">Try resetting your search or filter</p>
              <button
                onClick={() => {
                  setActiveSubCat('all');
                  setSearchQuery('');
                  setFilterDiscountOnly(false);
                }}
                className="mt-3 px-3 py-1.5 bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                View All Essentials
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
                          (e.target as HTMLImageElement).src = '/categories/cooking_oil.png';
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
