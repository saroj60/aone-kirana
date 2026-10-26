import React, { useState, useEffect, useRef } from 'react';
import { X, Star, Heart, ShoppingCart, Plus, Minus, Truck, ShieldCheck, Sparkles, ThumbsUp } from 'lucide-react';
import { Product, getSimilarProducts, getRecommendedProducts } from '../../data/mockData';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

interface ProductMiniCardProps {
  product: Product;
  onSelect: () => void;
}

const ProductMiniCard: React.FC<ProductMiniCardProps> = ({ product, onSelect }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const qty = getItemQuantity(product.id);

  return (
    <div className="w-36 flex-shrink-0 bg-white border border-slate-200/80 rounded-2xl p-2.5 flex flex-col justify-between shadow-xs hover:shadow-md transition group">
      <div className="cursor-pointer" onClick={onSelect}>
        <div className="relative w-full aspect-square bg-slate-50/80 rounded-xl p-2 flex items-center justify-center overflow-hidden mb-2">
          {product.discountPercentage && (
            <span className="absolute top-1 left-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
              {product.discountPercentage}% OFF
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <h5
          className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-brand-700 transition"
          title={product.name}
        >
          {product.name}
        </h5>
        <p className="text-[10px] text-slate-400 font-medium">{product.unit}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-xs font-black text-slate-900">Rs. {product.price}</span>
          {product.originalPrice && (
            <span className="text-[9px] text-slate-400 line-through">Rs. {product.originalPrice}</span>
          )}
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100">
        {qty === 0 ? (
          <button
            onClick={() => addToCart(product)}
            className="w-full py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition"
          >
            <Plus className="w-3 h-3 text-brand-700" />
            <span>Add</span>
          </button>
        ) : (
          <div className="w-full flex items-center justify-between bg-brand-700 text-white rounded-xl py-0.5 px-1 shadow-xs">
            <button
              onClick={() => updateQuantity(product.id, -1)}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-brand-800 active:scale-90 text-white"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-extrabold px-1">{qty}</span>
            <button
              onClick={() => updateQuantity(product.id, 1)}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-brand-800 active:scale-90 text-white"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectProduct
}) => {
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const [currentProduct, setCurrentProduct] = useState<Product>(product);
  const [selectedPack, setSelectedPack] = useState(product.unit);

  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    setCurrentProduct(product);
    setSelectedPack(product.unit);
  }, [product]);

  const handleSelectProduct = (newProd: Product) => {
    setCurrentProduct(newProd);
    setSelectedPack(newProd.unit);
    onSelectProduct?.(newProd);
    modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const qty = getItemQuantity(currentProduct.id);
  const isLiked = isWishlisted(currentProduct.id);

  const similarProducts = getSimilarProducts(currentProduct, 6);
  const recommendedProducts = getRecommendedProducts(currentProduct, 6);

  return (
    <div className="fixed inset-0 z-modal flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn" style={{ zIndex: 1000 }}>
      <div
        ref={modalScrollRef}
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        {/* Top Header Bar with Category Pill & Close Button */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
              {currentProduct.category}
            </span>
            {currentProduct.discountPercentage && (
              <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
                {currentProduct.discountPercentage}% OFF
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Image Frame */}
        <div className="relative w-full h-56 sm:h-64 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 p-4 flex items-center justify-center border border-slate-100 mb-4 overflow-hidden group">
          <button
            onClick={() => toggleWishlist(currentProduct.id)}
            aria-label="Wishlist"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-sm border border-slate-200/60 active:scale-90 transition hover:bg-white z-10"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              }`}
            />
          </button>
          <img
            src={currentProduct.image}
            alt={currentProduct.name}
            className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Title, Unit, Category & Rating */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
              {currentProduct.category}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{currentProduct.rating}</span>
              <span className="text-slate-400 font-normal">({currentProduct.reviewsCount} reviews)</span>
            </div>
          </div>

          <h3 className="text-xl font-black text-slate-900 mt-1.5 leading-tight">{currentProduct.name}</h3>
          <p className="text-xs text-slate-500 mt-1">{currentProduct.description}</p>
        </div>

        {/* Pack Size Selection */}
        {currentProduct.packSizes && currentProduct.packSizes.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Select Pack Size</h4>
            <div className="flex flex-wrap gap-2">
              {currentProduct.packSizes.map(size => {
                const isSelected = selectedPack === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedPack(size)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      isSelected
                        ? 'border-brand-700 bg-brand-50 text-brand-800 ring-2 ring-brand-200'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quality Guarantees */}
        <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Truck className="w-4 h-4 text-brand-700" />
            <span className="font-semibold">30–60 Min Express</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span className="font-semibold">100% Quality Checked</span>
          </div>
        </div>

        {/* Similar Items Section */}
        {similarProducts.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Similar Items</span>
                </h4>
                <p className="text-[11px] text-slate-400">Other options in {currentProduct.category}</p>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 pt-1 -mx-2 px-2 scrollbar-none scroll-smooth">
              {similarProducts.map(item => (
                <ProductMiniCard
                  key={item.id}
                  product={item}
                  onSelect={() => handleSelectProduct(item)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Products You May Also Like Section */}
        {recommendedProducts.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ThumbsUp className="w-4 h-4 text-brand-700" />
                  <span>Products You May Like</span>
                </h4>
                <p className="text-[11px] text-slate-400">Popular items frequently bought together</p>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 pt-1 -mx-2 px-2 scrollbar-none scroll-smooth">
              {recommendedProducts.map(item => (
                <ProductMiniCard
                  key={item.id}
                  product={item}
                  onSelect={() => handleSelectProduct(item)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pricing & Add to Cart Sticky Bottom Bar */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 mt-6 px-5 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4 z-20 shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">Rs. {currentProduct.price}</span>
              {currentProduct.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  Rs. {currentProduct.originalPrice}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 max-w-[180px]">
            {qty === 0 ? (
              <button
                onClick={() => addToCart(currentProduct)}
                className="w-full py-3 bg-brand-700 hover:bg-brand-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Basket</span>
              </button>
            ) : (
              <div className="w-full flex items-center justify-between bg-brand-700 text-white rounded-2xl p-1 shadow-md">
                <button
                  onClick={() => updateQuantity(currentProduct.id, -1)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-brand-800 active:scale-90 transition text-white"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-extrabold px-3">{qty}</span>
                <button
                  onClick={() => updateQuantity(currentProduct.id, 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-brand-800 active:scale-90 transition text-white"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
