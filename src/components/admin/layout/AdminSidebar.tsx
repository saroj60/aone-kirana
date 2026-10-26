import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Grid,
  Boxes,
  Users,
  Truck,
  Tag,
  Image,
  CreditCard,
  BarChart3,
  Star,
  Bell,
  Settings,
  Store,
  ExternalLink,
  X
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'customers'
  | 'delivery'
  | 'offers'
  | 'banners'
  | 'payments'
  | 'reports'
  | 'reviews'
  | 'notifications'
  | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onExitToStorefront: () => void;
  ordersBadgeCount?: number;
  lowStockBadgeCount?: number;
}

interface SidebarItem {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onExitToStorefront,
  ordersBadgeCount = 0,
  lowStockBadgeCount = 0
}) => {
  const MENU_ITEMS: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: ordersBadgeCount > 0 ? ordersBadgeCount : undefined,
      badgeColor: 'bg-brand-600 text-white'
    },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Grid },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      badge: lowStockBadgeCount > 0 ? lowStockBadgeCount : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'offers', label: 'Offers & Coupons', icon: Tag },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Aone Kirana"
                className="w-9 h-9 object-contain rounded-xl flex-shrink-0 drop-shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 text-base tracking-tight">Aone Kirana</span>
                </div>
                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded uppercase tracking-wider block w-fit">
                  Admin Console
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (14 items) */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none">
            {MENU_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-800 border border-brand-200/60 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-brand-700' : 'text-slate-400'
                      }`}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer: Storefront Link */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onExitToStorefront}
            className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-brand-50 text-brand-700 border border-slate-200/80 hover:border-brand-200 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
          >
            <span>Customer Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
};
