import React from 'react';
import { Heart, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Product } from '../../data/mockData';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const qty = getItemQuantity(product.id);
  const isLiked = isWishlisted(product.id);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 p-2 sm:p-3 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative group">
      {/* Top Bar: Discount Tag & Heart Wishlist */}
      <div className="flex items-center justify-between w-full mb-0.5">
        {product.discountPercentage ? (
          <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-tight shadow-2xs">
            {product.discountPercentage}% OFF
          </span>
        ) : (
          <span />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-50 hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition active:scale-90 ml-auto"
          aria-label="Wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
            }`}
          />
        </button>
      </div>

      {/* Product Image */}
      <div
        className="w-full h-28 sm:h-36 flex items-center justify-center cursor-pointer rounded-lg sm:rounded-xl bg-slate-50/60 p-2 my-0.5"
        onClick={() => onOpenDetails?.(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full max-h-full max-w-full object-contain rounded-md group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Product Details */}
      <div className="mt-1 cursor-pointer" onClick={() => onOpenDetails?.(product)}>
        <h4
          className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight line-clamp-2 min-h-[1.75rem] sm:min-h-[2rem] hover:text-brand-700 transition-colors"
          title={product.name}
        >
          {product.name}
        </h4>
        <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">({product.unit})</p>
      </div>

      {/* Price & Add to Cart Row */}
      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex flex-col gap-1.5 sm:gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-xs sm:text-sm font-black text-slate-900">
            Rs. {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] sm:text-xs text-slate-400 line-through">
              Rs. {product.originalPrice}
            </span>
          )}
        </div>

        {/* Add Button or Stepper */}
        {qty === 0 ? (
          <button
            onClick={() => addToCart(product)}
            className="w-full py-1.5 sm:py-2 bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all"
          >
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Add</span>
          </button>
        ) : (
          <div className="w-full flex items-center justify-between bg-brand-700 text-white rounded-lg sm:rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => updateQuantity(product.id, -1)}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md hover:bg-brand-800 active:scale-90 transition text-white"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <span className="text-[11px] sm:text-xs font-extrabold px-1">{qty}</span>
            <button
              onClick={() => updateQuantity(product.id, 1)}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md hover:bg-brand-800 active:scale-90 transition text-white"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
