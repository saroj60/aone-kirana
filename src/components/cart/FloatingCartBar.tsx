import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface FloatingCartBarProps {
  isCategoryPageOpen?: boolean;
  hasActiveLiveOrder?: boolean;
  isBottomNavVisible?: boolean;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  isCategoryPageOpen = false,
  hasActiveLiveOrder = false,
  isBottomNavVisible = true
}) => {
  const { cart, totalItems, subtotal, isCartOpen, setIsCartOpen } = useCart();
  const [bouncing, setBouncing] = useState(false);
  const [prevCount, setPrevCount] = useState(totalItems);

  // Trigger bounce / pulse animation whenever items are added
  useEffect(() => {
    if (totalItems > prevCount) {
      setBouncing(true);
      const timer = setTimeout(() => setBouncing(false), 500);
      setPrevCount(totalItems);
      return () => clearTimeout(timer);
    }
    setPrevCount(totalItems);
  }, [totalItems, prevCount]);

  // Only appear if there is at least 1 item in cart and cart drawer is not currently open
  if (totalItems === 0 || isCartOpen) {
    return null;
  }

  // Get up to 3 unique products to display their logos/thumbnails
  const uniqueProducts = Array.from(
    new Map(cart.map(item => [item.product.id, item.product])).values()
  );

  return (
    <div
      className={`fixed z-40 transition-all duration-300 animate-slide-up ${
        hasActiveLiveOrder
          ? 'bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] lg:bottom-24 lg:right-6 lg:left-auto lg:translate-x-0 lg:w-auto lg:min-w-[280px]'
          : isCategoryPageOpen || !isBottomNavVisible
          ? 'bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] lg:bottom-6 lg:right-6 lg:left-auto lg:translate-x-0 lg:w-auto lg:min-w-[280px]'
          : 'bottom-[68px] sm:bottom-20 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] lg:bottom-6 lg:right-6 lg:left-auto lg:translate-x-0 lg:w-auto lg:min-w-[280px]'
      }`}
    >
      <button
        onClick={() => setIsCartOpen(true)}
        className={`w-full flex items-center justify-between gap-3 bg-gradient-to-r from-brand-700 via-purple-700 to-brand-800 hover:from-brand-800 hover:to-purple-900 active:scale-95 text-white px-3.5 py-2 sm:py-2.5 rounded-full shadow-xl shadow-purple-950/30 border border-purple-400/40 backdrop-blur-sm transition-transform duration-200 cursor-pointer ${
          bouncing ? 'scale-105 ring-4 ring-purple-300/50' : 'scale-100'
        }`}
        aria-label="View Cart"
      >
        {/* Left Side: Overlapping Product Thumbnails */}
        <div className="flex items-center -space-x-2.5 overflow-hidden flex-shrink-0">
          {uniqueProducts.slice(0, 3).map((p, idx) => (
            <div
              key={p.id || idx}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white p-0.5 border-2 border-white shadow-xs overflow-hidden flex items-center justify-center flex-shrink-0 transition-transform"
              style={{ zIndex: 10 - idx }}
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-cover rounded-full"
                loading="eager"
              />
            </div>
          ))}
          {uniqueProducts.length > 3 && (
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-950 text-white text-[10px] font-extrabold border-2 border-white flex items-center justify-center flex-shrink-0 shadow-xs"
              style={{ zIndex: 6 }}
            >
              +{uniqueProducts.length - 3}
            </div>
          )}
        </div>

        {/* Center Text: View cart & item count */}
        <div className="flex flex-col text-left leading-tight min-w-0 flex-1 pl-1">
          <span className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-1.5">
            View cart
          </span>
          <span className="text-[11px] sm:text-xs text-purple-100 font-semibold truncate">
            {totalItems} {totalItems === 1 ? 'item added' : 'items added'}
            {subtotal > 0 && <span className="opacity-80"> • Rs. {subtotal}</span>}
          </span>
        </div>

        {/* Right Side: Chevron Icon */}
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 ml-1">
          <ChevronRight className="w-4 h-4 text-white stroke-[2.5]" />
        </div>
      </button>
    </div>
  );
};
