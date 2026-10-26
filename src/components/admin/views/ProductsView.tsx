import React, { useState, useEffect } from 'react';
import { useOrders } from '../../../context/OrderContext';
import { Product, ALL_PRODUCTS } from '../../../data/mockData';
import { Package, Search, Plus, Edit2, Check, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { categoryService } from '../../../services/categoryService';
import { ProductFormModal } from '../products/ProductFormModal';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, toggleStockStatus } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState('');
  const [categoryList, setCategoryList] = useState<string[]>([
    'all',
    'Vegetables',
    'Fruits',
    'Dairy',
    'Grains',
    'Essentials',
    'Snacks',
    'Bakery',
    'Household',
    'PersonalCare',
    'BabyCare'
  ]);

  // Modal & Toast state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Load categories from categoryService
  useEffect(() => {
    categoryService.getCategories({ status: 'active' }).then(cats => {
      if (cats && cats.length > 0) {
        const uniqueKeys = Array.from(new Set(cats.map(c => c.filterKey || c.name)));
        setCategoryList(['all', ...uniqueKeys]);
      }
    }).catch(console.warn);
  }, []);

  // Use products from context
  const catalogList = products && products.length > 0 ? products : ALL_PRODUCTS;

  const categories = categoryList;

  const filteredProducts = catalogList.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleStartInlineEdit = (p: Product) => {
    setEditingPriceId(p.id);
    setTempPrice(p.price.toString());
  };

  const handleSaveInlinePrice = (p: Product) => {
    const val = parseFloat(tempPrice);
    if (!isNaN(val) && val > 0) {
      updateProduct({ ...p, price: val });
      setToastMessage(`Price updated for "${p.name}"`);
      setTimeout(() => setToastMessage(null), 3000);
    }
    setEditingPriceId(null);
  };

  const handleOpenAddModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setSelectedProduct(p);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData: Product) => {
    if (selectedProduct) {
      await updateProduct(productData);
      setToastMessage(`Product "${productData.name}" updated successfully.`);
    } else {
      await addProduct(productData);
      setToastMessage(`Product "${productData.name}" added to catalog.`);
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteProduct = async (productId: string) => {
    const item = catalogList.find(p => p.id === productId);
    await deleteProduct(productId);
    setToastMessage(`Product "${item?.name || 'Item'}" deleted.`);
    setProductToDelete(null);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-700" />
            <span>Product Catalog</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total {catalogList.length} items in grocery database
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pr-3 font-semibold">Product</th>
              <th className="pb-3 px-3 font-semibold">Category</th>
              <th className="pb-3 px-3 font-semibold text-right">Price (Rs.)</th>
              <th className="pb-3 px-3 font-semibold text-center">In Stock</th>
              <th className="pb-3 pl-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                  No products found matching &quot;{searchTerm}&quot; in category &quot;{categoryFilter}&quot;.
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => {
                const isEditing = editingPriceId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200/60 flex-shrink-0"
                          onError={e => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900">{p.name}</h4>
                            {p.isFeatured && (
                              <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700 text-[9px] font-black uppercase">
                                Featured
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{p.unit}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={e => setTempPrice(e.target.value)}
                            className="w-20 px-2 py-1 bg-white border border-brand-500 rounded-lg text-xs font-bold text-slate-900"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveInlinePrice(p)}
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-black text-slate-900">Rs. {p.price}</span>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              Rs. {p.originalPrice}
                            </span>
                          )}
                          <button
                            onClick={() => handleStartInlineEdit(p)}
                            title="Quick edit price"
                            className="p-1 rounded-md text-slate-400 hover:text-brand-700 hover:bg-slate-100 transition"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleStockStatus(p.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition border ${
                          p.inStock
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-rose-50 hover:text-rose-700'
                            : 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>

                    <td className="py-3 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          title="Delete Product"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Row Delete Quick Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Delete Product?</h4>
                <p className="text-xs text-slate-500">
                  &quot;{productToDelete.name}&quot; will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProduct(productToDelete.id)}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        categories={categoryList}
      />
    </div>
  );
};
