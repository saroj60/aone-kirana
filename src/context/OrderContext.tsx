import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, Product, INITIAL_PRODUCTS, ALL_PRODUCTS } from '../data/mockData';
import confetti from 'canvas-confetti';
import {
  fetchProductsFromDb,
  createProductInDb,
  updateProductInDb,
  deleteProductFromDb,
  subscribeToProductChanges
} from '../services/productService';
import {
  createOrderInDb,
  fetchOrdersFromDb,
  updateOrderStatusInDb,
  subscribeToLiveOrders,
  CreateOrderPayload
} from '../services/orderService';
import { isSupabaseConfigured } from '../lib/supabase';

interface OrderContextType {
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  placeOrder: (orderData: CreateOrderPayload) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (updated: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleStockStatus: (productId: string) => Promise<void>;
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isLoadingData: boolean;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('aone_kirana_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= ALL_PRODUCTS.length) {
          return parsed;
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge custom/updated products with ALL_PRODUCTS
          const merged = [...parsed];
          ALL_PRODUCTS.forEach(p => {
            if (!merged.some(m => m.id === p.id)) {
              merged.push(p);
            }
          });
          return merged;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return ALL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('aone_kirana_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out legacy dummy mock orders
          return parsed.filter((o: Order) => o.id !== 'ord-101' && o.orderNumber !== 'AK-8924');
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#admin')
      );
    }
    return false;
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // 1. Initial Load of Products & Orders from DB
  const refreshOrders = useCallback(async () => {
    try {
      const dbOrders = await fetchOrdersFromDb();
      if (Array.isArray(dbOrders)) {
        setOrders(dbOrders);
        localStorage.setItem('aone_kirana_orders', JSON.stringify(dbOrders));
      }
    } catch (e) {
      console.error('Error refreshing orders:', e);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      setIsLoadingData(true);
      try {
        const dbProducts = await fetchProductsFromDb();
        if (isMounted && dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
          localStorage.setItem('aone_kirana_products', JSON.stringify(dbProducts));
        }
        await refreshOrders();
      } catch (err) {
        console.error('Error initializing products from API:', err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    };

    loadInitialData();

    // Re-sync products and orders when window/tab is focused
    const handleFocus = () => {
      fetchProductsFromDb().then(fresh => {
        if (fresh && fresh.length > 0) {
          setProducts(fresh);
        }
      }).catch(() => {});
      refreshOrders();
    };
    window.addEventListener('focus', handleFocus);

    // Periodic sync every 15s to keep real orders updated across devices
    const syncInterval = setInterval(() => {
      refreshOrders();
    }, 15000);

    // 2. Realtime Product Sync
    const unsubscribeProducts = subscribeToProductChanges(updatedProduct => {
      setProducts(prev =>
        prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
      );
    });

    // 3. Realtime Live Order Updates
    const unsubscribeOrders = subscribeToLiveOrders(
      updatedOrder => {
        setOrders(prev =>
          prev.map(ord =>
            ord.id === updatedOrder.id
              ? { ...ord, ...updatedOrder }
              : ord
          )
        );
        setActiveOrder(prev =>
          prev && prev.id === updatedOrder.id
            ? { ...prev, ...updatedOrder }
            : prev
        );
      },
      newOrderRow => {
        // Refresh when a new order is received
        refreshOrders();
      }
    );

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
      clearInterval(syncInterval);
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [refreshOrders]);

  // Sync to localStorage as backup
  useEffect(() => {
    localStorage.setItem('aone_kirana_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('aone_kirana_orders', JSON.stringify(orders));
  }, [orders]);

  // Place order function
  const placeOrder = async (orderData: CreateOrderPayload): Promise<Order> => {
    const created = await createOrderInDb(orderData);
    const orderToUse: Order = created || {
      id: `ord-${Date.now()}`,
      orderNumber: `AK-${Math.floor(1000 + Math.random() * 9000)}`,
      items: orderData.items,
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      total: orderData.total,
      deliveryAddress: orderData.deliveryAddress,
      customerPhone: orderData.customerPhone,
      customerName: orderData.customerName,
      paymentMethod: orderData.paymentMethod,
      status: 'Placed',
      createdAt: 'Just now',
      riderName: 'Bikash Shrestha',
      riderPhone: '9801987654'
    };

    setOrders(prev => [orderToUse, ...prev.filter(o => o.id !== orderToUse.id)]);
    setActiveOrder(orderToUse);

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error(e);
    }

    return orderToUse;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, status } : ord))
    );
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder(prev => (prev ? { ...prev, status } : null));
    }

    await updateOrderStatusInDb(orderId, status);
  };

  const addProduct = async (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev.filter(p => p.id !== newProduct.id)]);
    await createProductInDb(newProduct);
  };

  const updateProduct = async (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    await updateProductInDb(updated);
  };

  const deleteProduct = async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    await deleteProductFromDb(productId);
  };

  const toggleStockStatus = async (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const updated = { ...prod, inStock: !prod.inStock };
    setProducts(prev => prev.map(p => (p.id === productId ? updated : p)));
    await updateProductInDb(updated);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeOrder,
        setActiveOrder,
        placeOrder,
        updateOrderStatus,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleStockStatus,
        isAdminMode,
        setIsAdminMode,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isLoadingData,
        refreshOrders
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
};
