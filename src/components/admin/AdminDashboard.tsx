import React, { useState, useEffect } from 'react';
import { AdminSidebar, AdminTab } from './layout/AdminSidebar';
import { AdminHeader } from './layout/AdminHeader';
import { DashboardView } from './views/DashboardView';
import { OrdersView } from './views/OrdersView';
import { ProductsView } from './views/ProductsView';
import { CategoriesView } from './views/CategoriesView';
import { InventoryView } from './views/InventoryView';
import { CustomersView } from './views/CustomersView';
import { DeliveryView } from './views/DeliveryView';
import { OffersView } from './views/OffersView';
import { BannersView } from './views/BannersView';
import { PaymentsView } from './views/PaymentsView';
import { ReportsView } from './views/ReportsView';
import { ReviewsView } from './views/ReviewsView';
import { NotificationsView } from './views/NotificationsView';
import { SettingsView } from './views/SettingsView';
import { AdminProtectedRoute } from './auth/AdminProtectedRoute';
import { useOrders } from '../../context/OrderContext';

interface AdminDashboardProps {
  onClose: () => void;
  initialTab?: AdminTab;
}

const VALID_TABS: AdminTab[] = [
  'dashboard',
  'orders',
  'products',
  'categories',
  'inventory',
  'customers',
  'delivery',
  'offers',
  'banners',
  'payments',
  'reports',
  'reviews',
  'notifications',
  'settings'
];

class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode; currentTab: string; onReset: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Admin view error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.currentTab !== this.props.currentTab && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-2xl p-8 border border-red-200 text-center max-w-lg mx-auto my-12 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
            !
          </div>
          <h3 className="text-base font-bold text-slate-800">Something went wrong in this section</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-brand-700 text-white text-xs font-bold rounded-xl hover:bg-brand-800 transition cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={this.props.onReset}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, initialTab }) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>(initialTab || 'dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const { orders } = useOrders();
  const pendingOrdersCount = orders.filter(o => o.status !== 'Delivered').length;

  // Sync route on mount & popstate
  useEffect(() => {
    const parseTabFromLocation = (): AdminTab => {
      const path = window.location.pathname.replace(/^\/admin\/?/, '');
      const hash = window.location.hash.replace(/^#admin\/?/, '');
      const candidate = (path || hash) as AdminTab;
      return VALID_TABS.includes(candidate) ? candidate : 'dashboard';
    };

    const initial = parseTabFromLocation();
    setCurrentTab(initial);

    const handlePopState = () => {
      setCurrentTab(parseTabFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectTab = (tab: AdminTab) => {
    setCurrentTab(tab);
    window.history.pushState(null, '', `/admin/${tab}`);
  };

  const handleExitStorefront = () => {
    // Reset path when returning to storefront
    window.history.replaceState(null, '', '/');
    onClose();
  };

  return (
    <AdminProtectedRoute onExitToStorefront={handleExitStorefront}>
      <div className="fixed inset-0 z-50 bg-slate-50 flex overflow-hidden animate-fadeIn font-sans">
        {/* 1. FIXED LEFT SIDEBAR (14 items) */}
        <AdminSidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onExitToStorefront={handleExitStorefront}
          ordersBadgeCount={pendingOrdersCount}
          lowStockBadgeCount={6}
        />

        {/* 2. MAIN CONTENT WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 h-full overflow-hidden">
          {/* TOP NAVIGATION / HEADER */}
          <AdminHeader
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onExitToStorefront={handleExitStorefront}
            searchQuery={globalSearch}
            onSearchChange={setGlobalSearch}
            unreadNotificationsCount={3}
          />

          {/* SCROLLABLE MAIN DASHBOARD CONTENT */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
            <div className="max-w-7xl mx-auto pb-12">
              <AdminErrorBoundary currentTab={currentTab} onReset={() => handleSelectTab('dashboard')}>
                {currentTab === 'dashboard' && (
                  <DashboardView
                    onNavigateTab={handleSelectTab}
                    searchFilter={globalSearch}
                  />
                )}
                {currentTab === 'orders' && <OrdersView />}
                {currentTab === 'products' && <ProductsView />}
                {currentTab === 'categories' && <CategoriesView />}
                {currentTab === 'inventory' && <InventoryView />}
                {currentTab === 'customers' && <CustomersView />}
                {currentTab === 'delivery' && <DeliveryView />}
                {currentTab === 'offers' && <OffersView />}
                {currentTab === 'banners' && <BannersView />}
                {currentTab === 'payments' && <PaymentsView />}
                {currentTab === 'reports' && <ReportsView />}
                {currentTab === 'reviews' && <ReviewsView />}
                {currentTab === 'notifications' && <NotificationsView />}
                {currentTab === 'settings' && <SettingsView />}
              </AdminErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  );
};
