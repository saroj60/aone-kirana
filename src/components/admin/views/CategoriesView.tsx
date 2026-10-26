import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Apple,
  Wheat,
  Flame,
  Milk,
  Croissant,
  Coffee,
  Sparkles,
  Home,
  Baby,
  HeartPulse,
  ShoppingBag,
  Package,
  Grid,
  Filter,
  GripVertical,
  X
} from 'lucide-react';
import { categoryService, AdminCategory } from '../../../services/categoryService';
import { CategoryFormModal } from '../categories/CategoryFormModal';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Apple,
  Wheat,
  Flame,
  Milk,
  Croissant,
  Coffee,
  Sparkles,
  Home,
  Baby,
  HeartPulse,
  ShoppingBag,
  Package,
  Grid
};

export const CategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  
  // Subcategories popover / modal state
  const [viewingSubcategoriesCat, setViewingSubcategoriesCat] = useState<AdminCategory | null>(null);

  // Drag-and-drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Delete confirm states
  const [deletingCategory, setDeletingCategory] = useState<AdminCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success message toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter(cat => {
        if (statusFilter === 'active') return cat.isActive;
        if (statusFilter === 'disabled') return !cat.isActive;
        return true;
      })
      .filter(cat => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          cat.name.toLowerCase().includes(q) ||
          cat.slug.toLowerCase().includes(q) ||
          cat.description.toLowerCase().includes(q) ||
          cat.subcategories?.some(s => s.name.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [categories, statusFilter, searchQuery]);

  // Summary counts
  const totalCount = categories.length;
  const activeCount = categories.filter(c => c.isActive).length;
  const disabledCount = totalCount - activeCount;
  const totalSubcategories = categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0);

  // Status toggle handler
  const handleToggleStatus = async (cat: AdminCategory) => {
    try {
      // Optimistic update
      setCategories(prev =>
        prev.map(c => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c))
      );
      await categoryService.toggleStatus(cat.id);
      showToast(`Category "${cat.name}" is now ${!cat.isActive ? 'Active' : 'Disabled'}.`);
    } catch (err: any) {
      // Revert on error
      loadCategories();
      alert('Failed to update category status.');
    }
  };

  // Move display order Up / Down
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredCategories.length) return;

    const currentItem = filteredCategories[index];
    const targetItem = filteredCategories[targetIndex];

    const currentOrder = currentItem.displayOrder;
    const targetOrder = targetItem.displayOrder;

    // Swap display order
    const updatedCategories = categories.map(c => {
      if (c.id === currentItem.id) return { ...c, displayOrder: targetOrder };
      if (c.id === targetItem.id) return { ...c, displayOrder: currentOrder };
      return c;
    });

    setCategories(updatedCategories);

    try {
      await categoryService.reorder([
        { id: currentItem.id, displayOrder: targetOrder },
        { id: targetItem.id, displayOrder: currentOrder }
      ]);
      showToast(`Reordered "${currentItem.name}"`);
    } catch (err) {
      loadCategories();
    }
  };

  // Drag and drop reordering
  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const items = [...filteredCategories];
    const [moved] = items.splice(draggedIndex, 1);
    items.splice(dropIndex, 0, moved);

    // Reassign order 1..N
    const orderList = items.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1
    }));

    const orderMap = new Map(orderList.map(o => [o.id, o.displayOrder]));
    const updated = categories.map(c => ({
      ...c,
      displayOrder: orderMap.get(c.id) ?? c.displayOrder
    })).sort((a, b) => a.displayOrder - b.displayOrder);

    setCategories(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      await categoryService.reorder(orderList);
      showToast(`Reordered "${moved.name}" to position #${dropIndex + 1}`);
    } catch (err) {
      loadCategories();
    }
  };

  // Save (Create or Update)
  const handleSaveCategory = async (data: Partial<AdminCategory>) => {
    if (editingCategory) {
      await categoryService.updateCategory(editingCategory.id, data);
      showToast(`Category "${data.name}" updated successfully.`);
    } else {
      await categoryService.createCategory(data);
      showToast(`New category "${data.name}" created successfully.`);
    }
    await loadCategories();
  };

  // Delete Category
  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      await categoryService.deleteCategory(deletingCategory.id);
      showToast(`Category "${deletingCategory.name}" removed.`);
      setDeletingCategory(null);
      await loadCategories();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-slideUp">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700">
              <Layers className="w-5 h-5" />
            </span>
            <span>Category Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure primary grocery departments, subcategories, display ordering, and store visibility
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (window.confirm('Reset all categories back to default 10 Aone Kirana departments?')) {
                categoryService.resetToDefaults();
                loadCategories();
                showToast('Reset to default 10 departments.');
              }
            }}
            title="Reset to default categories"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-700/20 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Categories</span>
            <span className="text-lg font-bold text-slate-900">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Active Departments</span>
            <span className="text-lg font-bold text-emerald-600">{activeCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Disabled (Hidden)</span>
            <span className="text-lg font-bold text-amber-600">{disabledCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Subcategories</span>
            <span className="text-lg font-bold text-purple-600">{totalSubcategories}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search category, slug, or subcategory..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'active'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('disabled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'disabled'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disabled ({disabledCount})
          </button>
        </div>
      </div>

      {/* Main Categories Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-24">Order</th>
                <th className="py-3.5 px-4 w-20">Graphic</th>
                <th className="py-3.5 px-4">Category / Slug</th>
                <th className="py-3.5 px-4 min-w-[200px]">Subcategories</th>
                <th className="py-3.5 px-4 text-center w-28">Items</th>
                <th className="py-3.5 px-4 text-center w-28">Status</th>
                <th className="py-3.5 px-4 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading category departments...</span>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Filter className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600 text-sm">No matching categories found</p>
                    <p className="text-xs text-slate-400 mt-1">Try modifying your search or status filter</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat, index) => {
                  const IconComp = ICON_MAP[cat.icon] || Grid;
                  const isFirst = index === 0;
                  const isLast = index === filteredCategories.length - 1;
                  const isDragging = draggedIndex === index;
                  const isDragOver = dragOverIndex === index;

                  return (
                    <tr
                      key={cat.id}
                      draggable={!searchQuery && statusFilter === 'all'}
                      onDragStart={() => setDraggedIndex(index)}
                      onDragOver={e => {
                        e.preventDefault();
                        if (dragOverIndex !== index) setDragOverIndex(index);
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex === index) setDragOverIndex(null);
                      }}
                      onDrop={e => {
                        e.preventDefault();
                        handleDrop(index);
                      }}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={`transition-all group ${
                        isDragging
                          ? 'opacity-30 bg-slate-100'
                          : isDragOver
                          ? 'bg-brand-50/70 border-t-2 border-brand-500'
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Display Order with Drag Handle & Up/Down Arrows */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Drag Handle */}
                          <div
                            className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1 transition"
                            title="Drag to reorder"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => handleMoveOrder(index, 'up')}
                              className="text-slate-300 hover:text-slate-700 disabled:opacity-20 transition"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md text-[11px]">
                              #{cat.displayOrder ?? index + 1}
                            </span>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => handleMoveOrder(index, 'down')}
                              className="text-slate-300 hover:text-slate-700 disabled:opacity-20 transition"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Image & Icon Preview */}
                      <td className="py-3.5 px-4">
                        <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs">
                          <img
                            src={cat.cardImage}
                            alt={cat.name}
                            className="max-w-full max-h-full object-contain"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute -bottom-1 -right-1 bg-white border border-slate-200 rounded-full p-0.5 shadow-xs text-brand-700">
                            <IconComp className="w-3 h-3" />
                          </div>
                        </div>
                      </td>

                      {/* Name & Slug */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{cat.name}</span>
                          {!cat.isActive && (
                            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-md">
                              Hidden
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          slug: /{cat.slug}
                        </div>
                        {cat.description && (
                          <div className="text-[11px] text-slate-500 mt-1 line-clamp-1 max-w-sm">
                            {cat.description}
                          </div>
                        )}
                      </td>

                      {/* Subcategories */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-md items-center">
                          {cat.subcategories && cat.subcategories.length > 0 ? (
                            cat.subcategories.slice(0, 4).map((sub, sIdx) => (
                              <span
                                key={sIdx}
                                className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium border border-slate-200/60"
                              >
                                {sub.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">None configured</span>
                          )}
                          {cat.subcategories && cat.subcategories.length > 4 && (
                            <button
                              type="button"
                              onClick={() => setViewingSubcategoriesCat(cat)}
                              className="inline-block px-1.5 py-0.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-md text-[10px] font-bold transition"
                            >
                              +{cat.subcategories.length - 4} more
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Item count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100/80 px-2 py-1 rounded-lg">
                          {cat.itemCount || '0 Items'}
                        </span>
                      </td>

                      {/* Active/Disabled Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(cat)}
                            title={cat.isActive ? 'Click to disable category' : 'Click to enable category'}
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                              cat.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                cat.isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setIsModalOpen(true);
                            }}
                            title="Edit Category"
                            className="p-1.5 text-slate-400 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeletingCategory(cat)}
                            title="Delete Category"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Subcategories Detail Popover Modal */}
      {viewingSubcategoriesCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {viewingSubcategoriesCat.name} Subcategories
                </h3>
              </div>
              <button
                onClick={() => setViewingSubcategoriesCat(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
              {viewingSubcategoriesCat.subcategories.map((sub, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/80"
                >
                  {sub.name}
                </span>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const catToEdit = viewingSubcategoriesCat;
                  setViewingSubcategoriesCat(null);
                  setEditingCategory(catToEdit);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl transition"
              >
                Edit in Category Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Add/Edit Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        category={editingCategory}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
      />

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Category?</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to remove <strong className="text-slate-800">"{deletingCategory.name}"</strong>?
              Existing products linked to this category may lose their primary department assignment.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                disabled={isDeleting}
                className="py-2.5 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
                disabled={isDeleting}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
