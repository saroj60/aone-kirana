import { Home, LayoutGrid, Package, Tag, ClipboardList, User, Bike } from 'lucide-react';
import { NavTab } from '../common/BottomNav';

export type DesktopNav = NavTab | 'all-products' | 'offers';

interface DesktopLeftSidebarProps {
  activeNav: DesktopNav;
  setActiveNav: (nav: DesktopNav) => void;
  onShopNow: () => void;
  onOpenAdmin?: () => void;
  onOpenDeliveryPortal?: () => void;
}

export const DesktopLeftSidebar: React.FC<DesktopLeftSidebarProps> = ({
  activeNav,
  setActiveNav,
  onShopNow,
  onOpenAdmin,
  onOpenDeliveryPortal
}) => {
  const menuItems: { id: DesktopNav; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'all-products', label: 'All Products', icon: <Package className="w-4 h-4" /> },
    { id: 'offers', label: 'Offers', icon: <Tag className="w-4 h-4" /> },
    { id: 'orders', label: 'My Orders', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'account', label: 'My Account', icon: <User className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col justify-between py-2 pr-2 sticky top-20 self-start max-h-[calc(100vh-90px)] overflow-y-auto no-scrollbar">
      {/* Top Menu Links */}
      <nav className="space-y-1">
        {menuItems.map(item => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                isActive
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Rider Portal Navigation Link */}
        {onOpenDeliveryPortal && (
          <div className="pt-2 mt-2 border-t border-slate-100">
            <button
              onClick={onOpenDeliveryPortal}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:text-brand-800 hover:bg-purple-50 transition-all text-left group"
              title="Open Delivery Partner / Rider Portal"
            >
              <span className="w-5 h-5 rounded-lg bg-purple-100 text-brand-700 flex items-center justify-center group-hover:bg-brand-700 group-hover:text-white transition-colors">
                <Bike className="w-3.5 h-3.5" />
              </span>
              <span>Rider Portal</span>
            </button>
          </div>
        )}
      </nav>

      {/* Free Delivery Card at Bottom of Left Sidebar */}
      <div className="mt-8 bg-gradient-to-b from-purple-50/70 to-fuchsia-100/50 border border-purple-200/80 rounded-3xl p-4 text-center shadow-xs">
        <h4 className="text-xs font-black text-brand-900 leading-tight">
          <span className="text-brand-700 block text-sm">Free Delivery</span>
          on orders above <br />
          <span className="text-brand-800 font-extrabold text-sm">Rs. 500</span>
        </h4>

        {/* Scooter Delivery Graphic */}
        <div className="my-3 flex justify-center">
          <div className="w-24 h-20 relative flex items-center justify-center">
            {/* Scooter Graphic Illustration */}
            <svg viewBox="0 0 100 80" className="w-full h-full text-brand-700" fill="none">
              {/* Wheels */}
              <circle cx="25" cy="62" r="10" fill="#334155" stroke="#ffffff" strokeWidth="2"/>
              <circle cx="75" cy="62" r="10" fill="#334155" stroke="#ffffff" strokeWidth="2"/>
              <circle cx="25" cy="62" r="4" fill="#94a3b8"/>
              <circle cx="75" cy="62" r="4" fill="#94a3b8"/>
              {/* Scooter Body */}
              <path d="M25 62 L40 62 L55 45 L70 45 L75 62" stroke="#7e22ce" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M42 45 L50 25 L65 25" stroke="#7e22ce" strokeWidth="4" strokeLinecap="round"/>
              {/* Delivery Box */}
              <rect x="15" y="32" width="22" height="20" rx="3" fill="#9333ea" stroke="#7e22ce" strokeWidth="2"/>
              <path d="M22 36 L30 36 M22 42 L30 42" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
              {/* Rider Body */}
              <circle cx="56" cy="18" r="8" fill="#7e22ce"/>
              <path d="M50 26 C50 26 56 22 62 26 L58 45 L48 45 Z" fill="#a855f7"/>
              {/* Helmet Visor */}
              <path d="M58 17 Q62 17 64 20" stroke="#facc15" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <button
          onClick={onShopNow}
          className="w-full py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
        >
          Shop Now
        </button>
      </div>
    </aside>
  );
};
