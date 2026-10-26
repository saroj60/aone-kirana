import React, { useState, useRef, useEffect } from 'react';
import { Search, ScanLine, X, ShoppingCart } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useCart } from '../../context/CartContext';
import { Product } from '../../data/mockData';

interface SearchBarProps {
  onSelectProduct?: (product: Product) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectProduct }) => {
  const { products } = useOrders();
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close suggestions if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = searchTerm.trim()
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="relative px-4 pt-3 pb-1" ref={searchContainerRef}>
      {/* Search Input Container */}
      <div
        className={`flex items-center gap-2.5 bg-slate-50 border rounded-2xl px-3.5 py-2.5 transition-all shadow-sm ${
          isFocused ? 'border-brand-600 bg-white ring-2 ring-brand-100' : 'border-slate-200'
        }`}
      >
        <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search for products (e.g. rice, milk, bread...)"
          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <button
          onClick={() => setIsScannerOpen(true)}
          title="Scan Barcode / QR"
          className="text-brand-700 hover:text-brand-800 p-1 rounded-lg hover:bg-brand-50 transition"
        >
          <ScanLine className="w-5 h-5" />
        </button>
      </div>

      {/* Instant Search Results Dropdown */}
      {isFocused && searchTerm.trim() && (
        <div className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-80 overflow-y-auto z-40 p-2 divide-y divide-slate-100">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => {
                    onSelectProduct?.(product);
                    setIsFocused(false);
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-xl border border-slate-100"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{product.name}</h4>
                    <p className="text-xs text-slate-400">{product.unit} • {product.category}</p>
                    <span className="text-xs font-bold text-brand-700">Rs. {product.price}</span>
                  </div>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="px-3 py-1.5 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-400 text-sm">
              No products found matching "{searchTerm}".
            </div>
          )}
        </div>
      )}

      {/* Barcode / QR Scanner Simulator Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setIsScannerOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">Barcode & QR Scanner</h3>
            <p className="text-xs text-slate-500 mb-4">Point at any grocery barcode to add it to your basket</p>

            {/* Scanner Visual Frame */}
            <div className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-4 border-slate-800 shadow-inner">
              <div className="absolute inset-8 border-2 border-dashed border-purple-400/80 rounded-xl flex items-center justify-center">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" />
              </div>
              <p className="text-[11px] text-purple-300 font-mono z-10 bg-slate-900/80 px-2 py-1 rounded">
                Camera Active • Align code in box
              </p>
            </div>

            {/* Quick Simulation Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 mb-2 font-medium">Simulate Scanning a product:</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    addToCart(products[0]);
                    setIsScannerOpen(false);
                  }}
                  className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-semibold hover:bg-brand-100"
                >
                  Scan Tomato (Rs. 80)
                </button>
                <button
                  onClick={() => {
                    addToCart(products[3]);
                    setIsScannerOpen(false);
                  }}
                  className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-semibold hover:bg-brand-100"
                >
                  Scan Basmati Rice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
