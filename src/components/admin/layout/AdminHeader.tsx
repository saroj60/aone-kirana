import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Store,
  ShieldCheck,
  Settings,
  Activity,
  CheckCircle2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
  onExitToStorefront: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadNotificationsCount?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onOpenMobileMenu,
  onExitToStorefront,
  searchQuery,
  onSearchChange,
  unreadNotificationsCount = 3
}) => {
  const { adminUser, logout } = useAdminAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    window.history.replaceState(null, '', '/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-2xs">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search orders, products, inventory, customers..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls: Store Status, Notifications, Admin Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Store Active Status Pill */}
        <button
          onClick={() => setIsStoreOpen(!isStoreOpen)}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border ${
            isStoreOpen
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
          title="Click to toggle store accepting orders"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          <span>{isStoreOpen ? 'Store Open' : 'Store Paused'}</span>
        </button>

        {/* Notification Icon & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 transition relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center shadow-xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-fadeIn">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">Store Notifications</h4>
                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                  3 New
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 text-xs cursor-pointer">
                  <p className="font-bold text-slate-900">New Order #AK-8925</p>
                  <p className="text-slate-500 text-[11px]">Bipin Adhikari ordered 4 items (Rs. 1,450)</p>
                  <span className="text-[9px] text-slate-400 mt-1 block">2 mins ago</span>
                </div>
                <div className="p-3 hover:bg-slate-50 text-xs cursor-pointer">
                  <p className="font-bold text-amber-700 flex items-center gap-1">
                    <span>⚠️ Low Stock Alert</span>
                  </p>
                  <p className="text-slate-500 text-[11px]">Fortune Sunflower Oil has only 3 units left</p>
                  <span className="text-[9px] text-slate-400 mt-1 block">15 mins ago</span>
                </div>
                <div className="p-3 hover:bg-slate-50 text-xs cursor-pointer">
                  <p className="font-bold text-emerald-700 flex items-center gap-1">
                    <span>✅ Order Delivered</span>
                  </p>
                  <p className="text-slate-500 text-[11px]">Rider Bikash completed order #AK-8920</p>
                  <span className="text-[9px] text-slate-400 mt-1 block">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-700 text-white font-black text-xs flex items-center justify-center shadow-2xs">
              {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {adminUser?.name || 'Aone Kirana Admin'}
              </span>
              <span className="text-[10px] text-brand-700 font-semibold block leading-tight">
                Store Manager
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{adminUser?.name || 'Aone Kirana Admin'}</p>
                <p className="text-[11px] text-slate-400 truncate">{adminUser?.email || 'admin@aonekirana.com'}</p>
                <span className="mt-1 inline-block text-[9px] font-extrabold uppercase bg-brand-50 text-brand-800 px-2 py-0.5 rounded-md border border-brand-200">
                  Role: Verified Admin
                </span>
              </div>

              <div className="p-1 space-y-0.5 text-xs">
                <button
                  onClick={onExitToStorefront}
                  className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-brand-50 hover:text-brand-800 font-semibold flex items-center gap-2.5 text-left transition"
                >
                  <ExternalLink className="w-4 h-4 text-brand-600" />
                  <span>Switch to Storefront</span>
                </button>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2.5 text-left transition"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Store Settings</span>
                </button>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2.5 text-left transition"
                >
                  <Activity className="w-4 h-4 text-slate-400" />
                  <span>Activity Logs</span>
                </button>
              </div>

              <div className="p-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2.5 text-left transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
