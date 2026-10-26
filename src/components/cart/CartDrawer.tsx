import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CheckoutModal } from './CheckoutModal';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    finalTotal,
    clearCart
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  const percentToFreeDelivery = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-modal flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn" style={{ zIndex: 1000 }}>
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Your Basket</h3>
              <p className="text-xs text-slate-500">{cart.length} unique items</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Free Delivery Meter */}
        <div className="p-3.5 bg-brand-50/80 border-b border-brand-100">
          <div className="flex items-center justify-between text-xs font-bold text-brand-900 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-700" />
              {amountNeededForFreeDelivery === 0
                ? 'You qualify for FREE Delivery in Tikathali!'
                : `Add Rs. ${amountNeededForFreeDelivery} more for FREE Delivery`}
            </span>
            <span>{percentToFreeDelivery}%</span>
          </div>
          <div className="w-full h-2 bg-brand-200/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-700 rounded-full transition-all duration-300"
              style={{ width: `${percentToFreeDelivery}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-700 text-base mb-1">Your cart is empty</h4>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Explore our fresh vegetables, dairy, and grocery items to fill your basket.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-5 py-2.5 bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md hover:bg-brand-800 transition"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="py-3 flex items-center justify-between gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-14 h-14 object-cover rounded-xl border border-slate-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{item.product.name}</h4>
                  <p className="text-xs text-slate-400">
                    {item.product.unit} • Rs. {item.product.price}
                  </p>
                  <span className="text-xs font-extrabold text-brand-700">
                    Rs. {item.product.price * item.quantity}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg active:scale-90"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-extrabold px-2 text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg active:scale-90"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/60">
            <div className="space-y-1.5 mb-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  Delivery Fee {deliveryFee === 0 && <span className="text-[10px] text-brand-700 font-bold">(FREE)</span>}
                </span>
                <span className="font-semibold text-slate-800">
                  {deliveryFee === 0 ? 'Rs. 0' : `Rs. ${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-base text-brand-700">Rs. {finalTotal}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-3 bg-brand-700 hover:bg-brand-800 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Safe Delivery • Cash / eSewa / Fonepay</span>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={() => {
            setIsCheckoutOpen(false);
            setIsCartOpen(false);
          }}
        />
      )}
    </div>
  );
};
