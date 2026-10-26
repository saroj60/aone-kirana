import React, { useState, useEffect, useRef } from 'react';
import { Home, LayoutGrid, ClipboardList, User, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export type NavTab = 'home' | 'categories' | 'orders' | 'account';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isVisible?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  isVisible: propIsVisible
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const [internalVisible, setInternalVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // If not on home page, keep bottom bar visible
    if (activeTab !== 'home') {
      setInternalVisible(true);
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY || document.documentElement.scrollTop);
          const diff = currentScrollY - lastScrollY.current;

          // Always visible near top of home page
          if (currentScrollY <= 40) {
            setInternalVisible(true);
          } else if (Math.abs(diff) > 8) {
            if (diff > 0) {
              // Scrolling DOWN -> hide bar
              setInternalVisible(false);
            } else {
              // Scrolling UP -> reveal bar
              setInternalVisible(true);
            }
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const visible = propIsVisible !== undefined ? propIsVisible : internalVisible;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 max-w-[430px] mx-auto bg-white/98 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-in-out transform ${
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="px-4 py-2 flex items-center justify-between">
        {/* Navigation shortcuts (Left 4 items) */}
        <div className="flex-1 grid grid-cols-4 items-center gap-1">
          {/* Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'home'
                ? 'text-brand-700 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'fill-brand-700' : ''}`} />
            <span className="text-[11px] mt-0.5 tracking-tight">Home</span>
          </button>

          {/* Categories */}
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'categories'
                ? 'text-brand-700 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[11px] mt-0.5 tracking-tight">Categories</span>
          </button>

          {/* Orders */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'orders'
                ? 'text-brand-700 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[11px] mt-0.5 tracking-tight">Orders</span>
          </button>

          {/* Account */}
          <button
            onClick={() => setActiveTab('account')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'account'
                ? 'text-brand-700 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[11px] mt-0.5 tracking-tight">Account</span>
          </button>
        </div>

        {/* Right side Floating Cart Shortcut Button */}
        <div className="pl-2 flex-shrink-0">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative w-12 h-12 rounded-full bg-brand-700 hover:bg-brand-800 active:scale-95 text-white flex items-center justify-center shadow-lg transition-all ring-2 ring-white"
            aria-label="View Cart"
            title="View Cart"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-red text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm animate-pulse">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Subtle bottom home indicator for mobile */}
      <div className="w-32 h-1 bg-slate-900/40 rounded-full mx-auto mb-1.5" />
    </div>
  );
};
