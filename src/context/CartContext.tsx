import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, INITIAL_PRODUCTS } from '../data/mockData';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  getItemQuantity: (productId: string) => number;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  promoCode: string;
  promoDiscount: number;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  finalTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_DELIVERY_THRESHOLD = 500;
const STANDARD_DELIVERY_FEE = 40;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('aone_kirana_cart_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Match desktop mockup: Tomato (1), Potato (2), Milk (1) + bread/snack to reach subtotal Rs. 310
    return [
      {
        product: INITIAL_PRODUCTS[0], // Tomato Rs. 80
        quantity: 1
      },
      {
        product: INITIAL_PRODUCTS[1], // Potato Rs. 50
        quantity: 2
      },
      {
        product: INITIAL_PRODUCTS[5], // Milk (Dairy Home) Rs. 90
        quantity: 1
      },
      {
        product: {
          id: 'prod-bread-mini',
          name: 'Fresh Bread',
          unit: '400g',
          price: 40,
          category: 'Bakery',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
          rating: 4.6,
          reviewsCount: 45,
          inStock: true,
          description: 'Soft sliced bread'
        },
        quantity: 1
      }
    ];
  });

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('aone_kirana_cart_v2', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const getItemQuantity = (productId: string) => {
    const item = cart.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'AONE20' || clean === 'SAVE20') {
      const disc = Math.round(subtotal * 0.2);
      setPromoCode(clean);
      setPromoDiscount(disc);
      return { success: true, message: `20% Promo Code '${clean}' Applied!` };
    }
    if (clean === 'TIKATHALI') {
      setPromoCode(clean);
      setPromoDiscount(50);
      return { success: true, message: "Rs. 50 Local Discount Applied!" };
    }
    return { success: false, message: 'Invalid promo code. Try AONE20 or TIKATHALI' };
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : 0; // Free in Tikathali promotional launch
  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const finalTotal = Math.max(0, subtotal + deliveryFee - promoDiscount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getItemQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        amountNeededForFreeDelivery,
        promoCode,
        promoDiscount,
        applyPromoCode,
        finalTotal,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
