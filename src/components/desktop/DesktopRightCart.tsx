import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, Tag, Check, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface DesktopRightCartProps {
  onProceedCheckout: () => void;
}

export const DesktopRightCart: React.FC<DesktopRightCartProps> = ({ onProceedCheckout }) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    finalTotal,
    applyPromoCode,
    promoCode,
    promoDiscount
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; success: boolean } | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyPromoCode(inputCode);
    setPromoMessage({ text: res.message, success: res.success });
  };

  return (
    <aside className="w-80 flex-shrink-0 bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm flex flex-col justify-between self-start sticky top-20 min-h-[580px]">
      <div>
        {/* Cart Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            My Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
          </h3>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="py-2 space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold">Your cart is empty</p>
              <p className="text-[11px] text-slate-400 mt-1">Add items from the catalog</p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.product.id}
                className="flex items-center justify-between gap-2.5 p-2 bg-slate-50/60 hover:bg-slate-50 rounded-2xl border border-slate-100 transition"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-12 h-12 object-cover rounded-xl border border-slate-200/70 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                  <span className="text-[11px] text-slate-400 block">{item.product.unit}</span>
                  <span className="text-xs font-black text-slate-800">
                    Rs. {item.product.price}
                  </span>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 text-xs"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold px-1.5 text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 text-xs"
                      aria-label="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Promo Code, Bill Summary & Checkout */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        {/* Promo Code Input */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
            Apply Promo Code
          </label>
          <form onSubmit={handleApply} className="flex gap-1.5">
            <input
              type="text"
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase placeholder-slate-400 focus:outline-none focus:border-brand-600"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
            >
              Apply
            </button>
          </form>
          {promoMessage && (
            <p className={`text-[11px] font-semibold mt-1 ${promoMessage.success ? 'text-brand-700' : 'text-rose-500'}`}>
              {promoMessage.text}
            </p>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">Rs. {subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Delivery Charge</span>
            <span className="font-semibold text-brand-700">Free</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-brand-700 font-semibold">
              <span>Promo Discount ({promoCode})</span>
              <span>-Rs. {promoDiscount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total</span>
            <span className="text-base font-black text-brand-700">Rs. {finalTotal}</span>
          </div>
        </div>

        {/* Proceed to Checkout Button */}
        <button
          onClick={onProceedCheckout}
          disabled={cart.length === 0}
          className="w-full py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
