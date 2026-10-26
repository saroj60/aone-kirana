import React, { useState } from 'react';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrderProvider, useOrders } from './context/OrderContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { SearchBar } from './components/home/SearchBar';
import { HeroBanner } from './components/home/HeroBanner';
import { CategoryGrid } from './components/home/CategoryGrid';
import { DoubleMidBanner } from './components/home/DoubleMidBanner';
import { FeaturedProducts } from './components/home/FeaturedProducts';
import { HomeCategoryShowcases } from './components/home/HomeCategoryShowcases';
import { ProductDetailModal } from './components/home/ProductDetailModal';
import { FruitsVegetablesPage } from './components/category-pages/FruitsVegetablesPage';
import { RiceDalGrainsPage } from './components/category-pages/RiceDalGrainsPage';
import { CookingEssentialsPage } from './components/category-pages/CookingEssentialsPage';
import { DairyEggsPage } from './components/category-pages/DairyEggsPage';
import { BakeryBreakfastPage } from './components/category-pages/BakeryBreakfastPage';
import { PersonalCarePage } from './components/category-pages/PersonalCarePage';
import { HouseholdItemsPage } from './components/category-pages/HouseholdItemsPage';
import { BabyCarePage } from './components/category-pages/BabyCarePage';
import { CartDrawer } from './components/cart/CartDrawer';
import { FloatingCartBar } from './components/cart/FloatingCartBar';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { LocationModal } from './components/common/LocationModal';
import { NotificationsModal } from './components/common/NotificationsModal';
import { OrderTrackingModal } from './components/orders/OrderTrackingModal';
import { CategoriesView } from './components/categories/CategoriesView';
import { OrdersView } from './components/orders/OrdersView';
import { AccountView } from './components/account/AccountView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DesktopHeader } from './components/desktop/DesktopHeader';
import { DesktopLeftSidebar, DesktopNav } from './components/desktop/DesktopLeftSidebar';
import { DesktopRightCart } from './components/desktop/DesktopRightCart';
import { DeliveryPartnerPortal } from './components/delivery-portal/DeliveryPartnerPortal';
import { Bike, Navigation, Package, ShoppingBag, X, Clock } from 'lucide-react';
import { Product, Order } from './data/mockData';

const MainApp: React.FC = () => {
  // Responsive screen detection (Mobile < 1024px, Desktop >= 1024px)
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activeNav, setActiveNav] = useState<DesktopNav>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isFruitsVegPageOpen, setIsFruitsVegPageOpen] = useState(false);
  const [isGrainsPageOpen, setIsGrainsPageOpen] = useState(false);
  const [isCookingPageOpen, setIsCookingPageOpen] = useState(false);
  const [isDairyPageOpen, setIsDairyPageOpen] = useState(false);
  const [isBakeryPageOpen, setIsBakeryPageOpen] = useState(false);
  const [isPersonalCarePageOpen, setIsPersonalCarePageOpen] = useState(false);
  const [isHouseholdPageOpen, setIsHouseholdPageOpen] = useState(false);
  const [isBabyCarePageOpen, setIsBabyCarePageOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDeliveryPortalOpen, setIsDeliveryPortalOpen] = useState(false);
  const [dismissedOrderId, setDismissedOrderId] = useState<string | null>(null);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const lastScrollYRef = React.useRef(0);

  // Auto-hide bottom bar on scroll down in home page
  React.useEffect(() => {
    if (!isMobileScreen || activeNav !== 'home') {
      setIsBottomNavVisible(true);
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY || document.documentElement.scrollTop);
          const diff = currentScrollY - lastScrollYRef.current;

          if (currentScrollY <= 40) {
            setIsBottomNavVisible(true);
          } else if (Math.abs(diff) > 8) {
            if (diff > 0) {
              // Scrolling DOWN: hide bottom nav
              setIsBottomNavVisible(false);
            } else {
              // Scrolling UP: reveal bottom nav
              setIsBottomNavVisible(true);
            }
          }
          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileScreen, activeNav]);

  const { activeOrder, setActiveOrder, isAdminMode, setIsAdminMode, products, orders } = useOrders();
  const { isAuthModalOpen, setIsAuthModalOpen } = useAuth();

  // Auto-detect /admin or /delivery path or hash on initial load
  React.useEffect(() => {
    if (window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#admin')) {
      setIsAdminMode(true);
    }
    if (
      window.location.pathname.startsWith('/delivery') ||
      window.location.hash.startsWith('#delivery') ||
      window.location.pathname.startsWith('/rider') ||
      window.location.hash.startsWith('#rider')
    ) {
      setIsDeliveryPortalOpen(true);
    }
  }, []);

  const handleSelectCategory = (cat: any) => {
    setSelectedCategory(cat);
    const name = cat?.name?.toLowerCase() || '';
    const id = cat?.id || '';
    if (name.includes('baby') || id.includes('baby')) {
      setIsBabyCarePageOpen(true);
      setIsFruitsVegPageOpen(false);
      setIsGrainsPageOpen(false);
      setIsCookingPageOpen(false);
      setIsDairyPageOpen(false);
      setIsBakeryPageOpen(false);
      setIsPersonalCarePageOpen(false);
      setIsHouseholdPageOpen(false);
    } else if (name.includes('vegetable') || id.includes('veg')) {
      setIsFruitsVegPageOpen(true);
      setIsGrainsPageOpen(false);
      setIsCookingPageOpen(false);
      setIsDairyPageOpen(false);
      setIsBakeryPageOpen(false);
      setIsPersonalCarePageOpen(false);
      setIsHouseholdPageOpen(false);
      setIsBabyCarePageOpen(false);
    } else if (name.includes('rice') || name.includes('grain') || name.includes('dal') || id.includes('grain')) {
      setIsGrainsPageOpen(true);
      setIsFruitsVegPageOpen(false);
      setIsCookingPageOpen(false);
      setIsDairyPageOpen(false);
      setIsBakeryPageOpen(false);
      setIsPersonalCarePageOpen(false);
      setIsHouseholdPageOpen(false);
      setIsBabyCarePageOpen(false);
    } else if (name.includes('cooking') || name.includes('essential') || name.includes('oil') || id.includes('essential') || id.includes('cook')) {
      setIsCookingPageOpen(true);
      setIsFruitsVegPageOpen(false);
      setIsGrainsPageOpen(false);
      setIsDairyPageOpen(false);
      setIsBakeryPageOpen(false);
      setIsPersonalCarePageOpen(false);
      setIsHouseholdPageOpen(false);
      setIsBabyCarePageOpen(false);
    } else if (name.includes('dairy') || name.includes('egg') || name.includes('milk') || id.includes('dairy')) {
      setIsDairyPageOpen(true);
      setIsFruitsVegPageOpen(false);
      setIsGrainsPageOpen(false);
      setIsCookingPageOpen(false);
      setIsBakeryPageOpen(false);
      setIsPersonalCarePageOpen(false);
      setIsHouseholdPageOpen(false);
      setIsBabyCarePageOpen(false);
    } else if (name.includes('bakery') || name.includes('breakfast') || name.includes('bread') || id.includes('bakery')) {
      setIsBakeryPageOpen(true);
      setIsFruitsVegPageOpen(false);
      setIsGrainsPageOpen(false);
      setIsCookingPageOpen(false);
      setIsDairyPageOpen(false);
      setIsPersonalCarePageOpen(false);
      setIsHouseholdPageOpen(false);
      setIsBabyCarePageOpen(false);
    } else if (name.includes('personal') || name.includes('beauty') || id.includes('personal')) {
      setIsPersonalCarePageOpen(true);
      setIsFruitsVegPageOpen(false);
      setIsGrainsPageOpen(false);
      setIsCookingPageOpen(false);
      setIsDairyPageOpen(false);
      setIsBakeryPageOpen(false);
      setIsHouseholdPageOpen(false);
      setIsBabyCarePageOpen(false);
    } else if (name.includes('house') || name.includes('clean') || id.includes('house')) {
      setIsHouseholdPageOpen(true);
      setIsFruitsVegPageOpen(false);
      setIsGrainsPageOpen(false);
      setIsCookingPageOpen(false);
      setIsDairyPageOpen(false);
      setIsBakeryPageOpen(false);
      setIsPersonalCarePageOpen(false);
      setIsBabyCarePageOpen(false);
    } else {
      setActiveNav('categories');
    }
  };

  const closeAllCategoryPages = () => {
    setIsFruitsVegPageOpen(false);
    setIsGrainsPageOpen(false);
    setIsCookingPageOpen(false);
    setIsDairyPageOpen(false);
    setIsBakeryPageOpen(false);
    setIsPersonalCarePageOpen(false);
    setIsHouseholdPageOpen(false);
    setIsBabyCarePageOpen(false);
    setSelectedCategory(null);
  };

  const handleShopNow = () => {
    const el = document.getElementById('featured-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentTracking = trackingOrder || activeOrder;

  // Active ongoing order placed by the customer (Placed, Packed, or Out for Delivery)
  const liveOrder =
    activeOrder && activeOrder.status !== 'Delivered' && activeOrder.status !== 'Cancelled'
      ? activeOrder
      : orders.find(
          o =>
            o.id !== 'ord-101' &&
            o.status !== 'Delivered' &&
            o.status !== 'Cancelled'
        );

  const searchResults = searchTerm.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans">
      {/* MOBILE APP VIEW (Active on screens < 1024px) */}
      {isMobileScreen && (
        <div className="flex-1 flex justify-center bg-slate-100/70 min-h-screen">
          <div className="w-full max-w-lg bg-white min-h-screen flex flex-col shadow-xl sm:border-x sm:border-slate-200/80 relative">
            {/* If Fruit & Vegetable page is open */}
            {isFruitsVegPageOpen ? (
              <div className="flex-1 flex flex-col">
                <FruitsVegetablesPage
                  onBack={closeAllCategoryPages}
                  onOpenProductDetails={p => setSelectedProduct(p)}
                />
              </div>
            ) : isGrainsPageOpen ? (
              /* If Rice, Dal & Grains page is open */
              <div className="flex-1 flex flex-col">
                <RiceDalGrainsPage
                  onBack={closeAllCategoryPages}
                  onOpenProductDetails={p => setSelectedProduct(p)}
                />
              </div>
            ) : isCookingPageOpen ? (
              /* If Cooking Essentials page is open */
              <div className="flex-1 flex flex-col">
                <CookingEssentialsPage
                  onBack={closeAllCategoryPages}
                  onOpenProductDetails={p => setSelectedProduct(p)}
                />
              </div>
            ) : isDairyPageOpen ? (
              /* If Dairy & Eggs page is open */
              <div className="flex-1 flex flex-col">
                <DairyEggsPage
                  onBack={closeAllCategoryPages}
                  onOpenProductDetails={p => setSelectedProduct(p)}
                />
              </div>
            ) : isBakeryPageOpen ? (
              /* If Bakery & Breakfast page is open */
              <div className="flex-1 flex flex-col">
                <BakeryBreakfastPage
                  onBack={closeAllCategoryPages}
                  onOpenProductDetails={p => setSelectedProduct(p)}
                />
              </div>
            ) : isPersonalCarePageOpen ? (
              /* If Personal Care page is open */
              <div className="flex-1 flex flex-col">
                <PersonalCarePage
                  onBack={closeAllCategoryPages}
                  onOpenProductDetails={p => setSelectedProduct(p)}
                />
              </div>
            ) : isHouseholdPageOpen ? (
              /* If Household Items page is open */
              <div className="flex-1 flex flex-col">
                <HouseholdItemsPage
                  onBack={closeAllCategoryPages}
                  onOpenProductDetails={p => setSelectedProduct(p)}
                />
              </div>
            ) : isBabyCarePageOpen ? (
              /* If Baby Care page is open */
              <div className="flex-1 flex flex-col">
                <BabyCarePage
                  onBack={closeAllCategoryPages}
                  onOpenProductDetails={p => setSelectedProduct(p)}
                />
              </div>
            ) : (
              <>
                {/* Mobile Header (Starts directly at the top) */}
                <Header onOpenAccount={() => setActiveNav('account')} />

                {/* Mobile Scrollable Content */}
                <div className="flex-1 pb-24">
                  {activeNav === 'home' && (
                    <div>
                      <SearchBar onSelectProduct={p => setSelectedProduct(p)} />
                      <HeroBanner onShopNow={handleShopNow} isMobileLayout={true} />
                      <div className="px-4">
                        <CategoryGrid
                          isMobileLayout={true}
                          onSelectCategory={handleSelectCategory}
                          onViewAll={() => setActiveNav('categories')}
                        />
                      </div>
                      <div className="px-4">
                        <DoubleMidBanner
                          isMobileLayout={true}
                          onShopNow={handleShopNow}
                        />
                      </div>
                      <div id="featured-section" className="px-4">
                        <HomeCategoryShowcases
                          isMobileLayout={true}
                          onSelectCategory={handleSelectCategory}
                          onOpenProductDetails={p => setSelectedProduct(p)}
                        />
                      </div>
                    </div>
                  )}

                  {(activeNav === 'categories' || activeNav === 'all-products') && (
                    <div className="px-1">
                      <CategoriesView
                        isMobileLayout={true}
                        initialCategory={selectedCategory}
                        onSelectCategory={handleSelectCategory}
                        onOpenProductDetails={p => setSelectedProduct(p)}
                      />
                    </div>
                  )}

                  {activeNav === 'orders' && (
                    <OrdersView onTrackOrder={o => setTrackingOrder(o)} />
                  )}

                  {activeNav === 'account' && (
                    <AccountView
                      onOpenAdmin={() => setIsAdminMode(true)}
                      onOpenDeliveryPortal={() => setIsDeliveryPortalOpen(true)}
                    />
                  )}
                </div>

                {/* Mobile Bottom Navigation Shortcut */}
                <BottomNav
                  activeTab={activeNav === 'all-products' || activeNav === 'offers' ? 'home' : (activeNav as NavTab)}
                  setActiveTab={tab => {
                    closeAllCategoryPages();
                    setActiveNav(tab);
                  }}
                  isVisible={isBottomNavVisible}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* DESKTOP 3-COLUMN STORE VIEW (Active on screens >= 1024px) */}
      {!isMobileScreen && (
        <div className="flex-1 flex flex-col bg-white">
          {/* Full-width Desktop Header */}
          <DesktopHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onOpenAccount={() => setActiveNav('account')}
            onOpenAdmin={() => setIsAdminMode(true)}
            onOpenDeliveryPortal={() => setIsDeliveryPortalOpen(true)}
          />

          {/* Search Result Overlay if searching */}
          {searchTerm.trim() && (
            <div className="bg-slate-50 border-b border-slate-200 py-3 px-6">
              <div className="max-w-7xl mx-auto">
                <h3 className="text-xs font-bold text-slate-700 mb-2">
                  Search Results for "{searchTerm}" ({searchResults.length})
                </h3>
                <div className="grid grid-cols-6 gap-3">
                  {searchResults.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className="p-2 bg-white border rounded-xl hover:shadow-md cursor-pointer transition"
                    >
                      <img src={p.image} alt={p.name} className="w-full h-24 object-cover rounded-lg mb-1" />
                      <h4 className="text-xs font-bold truncate">{p.name}</h4>
                      <span className="text-xs font-extrabold text-brand-700">Rs. {p.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* If Fruits & Veg, Grains, Cooking, Dairy, or Bakery Page is Open on Desktop */}
          {isFruitsVegPageOpen ? (
            <div className="max-w-6xl mx-auto w-full px-6 py-4">
              <FruitsVegetablesPage
                onBack={closeAllCategoryPages}
                onOpenProductDetails={p => setSelectedProduct(p)}
              />
            </div>
          ) : isGrainsPageOpen ? (
            <div className="max-w-6xl mx-auto w-full px-6 py-4">
              <RiceDalGrainsPage
                onBack={closeAllCategoryPages}
                onOpenProductDetails={p => setSelectedProduct(p)}
              />
            </div>
          ) : isCookingPageOpen ? (
            <div className="max-w-6xl mx-auto w-full px-6 py-4">
              <CookingEssentialsPage
                onBack={closeAllCategoryPages}
                onOpenProductDetails={p => setSelectedProduct(p)}
              />
            </div>
          ) : isDairyPageOpen ? (
            <div className="max-w-6xl mx-auto w-full px-6 py-4">
              <DairyEggsPage
                onBack={closeAllCategoryPages}
                onOpenProductDetails={p => setSelectedProduct(p)}
              />
            </div>
          ) : isBakeryPageOpen ? (
            <div className="max-w-6xl mx-auto w-full px-6 py-4">
              <BakeryBreakfastPage
                onBack={closeAllCategoryPages}
                onOpenProductDetails={p => setSelectedProduct(p)}
              />
            </div>
          ) : isPersonalCarePageOpen ? (
            <div className="max-w-6xl mx-auto w-full px-6 py-4">
              <PersonalCarePage
                onBack={closeAllCategoryPages}
                onOpenProductDetails={p => setSelectedProduct(p)}
              />
            </div>
          ) : isHouseholdPageOpen ? (
            <div className="max-w-6xl mx-auto w-full px-6 py-4">
              <HouseholdItemsPage
                onBack={closeAllCategoryPages}
                onOpenProductDetails={p => setSelectedProduct(p)}
              />
            </div>
          ) : isBabyCarePageOpen ? (
            <div className="max-w-6xl mx-auto w-full px-6 py-4">
              <BabyCarePage
                onBack={closeAllCategoryPages}
                onOpenProductDetails={p => setSelectedProduct(p)}
              />
            </div>
          ) : (
            /* 3-Column Layout Container */
            <div className="max-w-[1440px] w-full mx-auto px-4 lg:px-6 py-4 flex gap-5 lg:gap-6">
              {/* Left Column: Navigation Sidebar */}
              <DesktopLeftSidebar
                activeNav={activeNav}
                setActiveNav={nav => {
                  setIsFruitsVegPageOpen(false);
                  setIsGrainsPageOpen(false);
                  setIsCookingPageOpen(false);
                  setIsDairyPageOpen(false);
                  setIsBakeryPageOpen(false);
                  setIsPersonalCarePageOpen(false);
                  setIsHouseholdPageOpen(false);
                  setIsBabyCarePageOpen(false);
                  setActiveNav(nav);
                }}
                onShopNow={handleShopNow}
                onOpenAdmin={() => setIsAdminMode(true)}
                onOpenDeliveryPortal={() => setIsDeliveryPortalOpen(true)}
              />

              {/* Center Column: Main Content */}
              <main className="flex-1 min-w-0 pb-16">
                {activeNav === 'home' && (
                  <div className="space-y-4">
                    {/* Hero Banner */}
                    <HeroBanner onShopNow={handleShopNow} />

                    {/* Shop by Category */}
                    <CategoryGrid
                      isMobileLayout={false}
                      onSelectCategory={handleSelectCategory}
                      onViewAll={() => setActiveNav('categories')}
                    />

                    {/* Side-by-Side Double Promotional Banners */}
                    <DoubleMidBanner
                      isMobileLayout={false}
                      onShopNow={handleShopNow}
                    />

                    {/* Category Products Showcase (3 lines each category + See all) */}
                    <div id="featured-section">
                      <HomeCategoryShowcases
                        isMobileLayout={false}
                        onSelectCategory={handleSelectCategory}
                        onOpenProductDetails={p => setSelectedProduct(p)}
                      />
                    </div>
                  </div>
                )}

                {(activeNav === 'categories' || activeNav === 'all-products') && (
                  <CategoriesView
                    isMobileLayout={false}
                    initialCategory={selectedCategory}
                    onOpenProductDetails={p => setSelectedProduct(p)}
                  />
                )}

                {activeNav === 'offers' && (
                  <div className="space-y-4">
                    <DoubleMidBanner
                      isMobileLayout={false}
                      onShopNow={handleShopNow}
                    />
                    <FeaturedProducts
                      isMobileLayout={false}
                      onOpenProductDetails={p => setSelectedProduct(p)}
                      onViewAll={() => setActiveNav('all-products')}
                    />
                  </div>
                )}

                {activeNav === 'orders' && (
                  <OrdersView onTrackOrder={o => setTrackingOrder(o)} />
                )}

                {activeNav === 'account' && (
                  <AccountView
                    onOpenAdmin={() => setIsAdminMode(true)}
                    onOpenDeliveryPortal={() => setIsDeliveryPortalOpen(true)}
                  />
                )}
              </main>

              {/* Right Column: Persistent Desktop Cart Panel */}
              <DesktopRightCart onProceedCheckout={() => setIsCheckoutOpen(true)} />
            </div>
          )}
        </div>
      )}

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <LocationModal />
      <NotificationsModal />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={() => setIsCheckoutOpen(false)}
        />
      )}

      {currentTracking && (
        <OrderTrackingModal
          order={currentTracking}
          onClose={() => {
            setTrackingOrder(null);
            setActiveOrder(null);
          }}
        />
      )}

      {/* Floating Bottom Cart Pill (Zepto / Blinkit style with product logos & count) */}
      {!currentTracking && !isAdminMode && !isDeliveryPortalOpen && !isCheckoutOpen && (
        <FloatingCartBar
          isCategoryPageOpen={
            isFruitsVegPageOpen ||
            isGrainsPageOpen ||
            isCookingPageOpen ||
            isDairyPageOpen ||
            isBakeryPageOpen ||
            isPersonalCarePageOpen ||
            isHouseholdPageOpen ||
            isBabyCarePageOpen
          }
          hasActiveLiveOrder={Boolean(liveOrder && liveOrder.id !== dismissedOrderId)}
          isBottomNavVisible={isBottomNavVisible}
        />
      )}

      {/* Floating Active Order Live Tracker Bar (Only appears after placing an order) */}
      {!currentTracking && !isAdminMode && !isDeliveryPortalOpen && liveOrder && liveOrder.id !== dismissedOrderId && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[94%] sm:w-auto animate-fadeIn">
          <div className="relative w-full sm:w-auto bg-slate-900/95 hover:bg-slate-900 text-white pl-3.5 pr-3 py-2.5 rounded-2xl shadow-2xl border border-purple-500/40 backdrop-blur-md flex items-center justify-between gap-3 sm:gap-4 transition">
            {/* Dismiss 'X' Button */}
            <button
              onClick={e => {
                e.stopPropagation();
                setDismissedOrderId(liveOrder.id);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center border border-slate-600 shadow-md text-xs transition active:scale-90"
              title="Dismiss tracking bar"
              aria-label="Dismiss tracking bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Clickable Area to open Tracking */}
            <div
              onClick={() => setTrackingOrder(liveOrder)}
              className="flex items-center gap-3 text-left cursor-pointer flex-1 min-w-0"
            >
              {/* Status-Specific Animated Icon */}
              <div
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-xs ${
                  liveOrder.status === 'Out for Delivery'
                    ? 'bg-brand-700'
                    : liveOrder.status === 'Packed'
                    ? 'bg-blue-600'
                    : 'bg-amber-600'
                }`}
              >
                {liveOrder.status === 'Out for Delivery' ? (
                  <>
                    <Bike className="w-5 h-5 text-purple-100 animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-ping" />
                  </>
                ) : liveOrder.status === 'Packed' ? (
                  <>
                    <ShoppingBag className="w-5 h-5 text-blue-100 animate-bounce-subtle" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-400 border-2 border-slate-900" />
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5 text-amber-100 animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-slate-900" />
                  </>
                )}
              </div>

              {/* Order Info & Delivery Time */}
              <div className="truncate">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-white truncate">
                    {liveOrder.status === 'Out for Delivery'
                      ? 'Rider On The Way'
                      : liveOrder.status === 'Packed'
                      ? 'Groceries Packed'
                      : 'Order Placed'}
                  </span>
                  <span className="text-[10px] text-purple-200 font-bold">
                    #{liveOrder.orderNumber}
                  </span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                      liveOrder.status === 'Out for Delivery'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : liveOrder.status === 'Packed'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                    }`}
                  >
                    {liveOrder.status === 'Out for Delivery'
                      ? 'LIVE GPS'
                      : liveOrder.status === 'Packed'
                      ? 'PACKED'
                      : 'RECEIVED'}
                  </span>
                </div>

                <p className="text-[11px] text-purple-200/90 truncate mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-300 flex-shrink-0" />
                  <span>
                    {liveOrder.status === 'Out for Delivery'
                      ? 'Arriving in ~14 mins • Tikathali Hub'
                      : liveOrder.status === 'Packed'
                      ? 'Est. delivery: 20–25 mins • Assigning rider'
                      : 'Est. delivery: 25–35 mins • Preparing items'}
                  </span>
                </p>
              </div>
            </div>

            {/* Action CTA Button */}
            <button
              onClick={() => setTrackingOrder(liveOrder)}
              className="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-600 active:scale-95 text-white px-3 py-2 rounded-xl text-xs font-extrabold transition flex-shrink-0 shadow-xs"
            >
              <span>{liveOrder.status === 'Out for Delivery' ? 'View Map' : 'Track'}</span>
              <Navigation className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {isAdminMode && (
        <AdminDashboard onClose={() => setIsAdminMode(false)} />
      )}

      {isDeliveryPortalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900">
          <DeliveryPartnerPortal
            onClose={() => setIsDeliveryPortalOpen(false)}
            onOpenAdmin={() => {
              setIsDeliveryPortalOpen(false);
              setIsAdminMode(true);
            }}
          />
        </div>
      )}

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <LocationProvider>
          <WishlistProvider>
            <OrderProvider>
              <CartProvider>
                <MainApp />
              </CartProvider>
            </OrderProvider>
          </WishlistProvider>
        </LocationProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
};

export default App;
