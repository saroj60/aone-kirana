import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Check,
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
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { AdminCategory, CategorySubcategory } from '../../../services/categoryService';

interface CategoryFormModalProps {
  isOpen: boolean;
  category: AdminCategory | null;
  onClose: () => void;
  onSave: (categoryData: Partial<AdminCategory>) => Promise<void>;
}

const AVAILABLE_ICONS = [
  { name: 'Apple', label: 'Produce / Fruits', component: Apple },
  { name: 'Wheat', label: 'Grains / Staples', component: Wheat },
  { name: 'Flame', label: 'Cooking Oils / Spices', component: Flame },
  { name: 'Milk', label: 'Dairy / Eggs', component: Milk },
  { name: 'Croissant', label: 'Bakery / Breakfast', component: Croissant },
  { name: 'Coffee', label: 'Beverages / Drinks', component: Coffee },
  { name: 'Sparkles', label: 'Personal Care', component: Sparkles },
  { name: 'Home', label: 'Household Items', component: Home },
  { name: 'Baby', label: 'Baby Care', component: Baby },
  { name: 'HeartPulse', label: 'Health & Wellness', component: HeartPulse },
  { name: 'ShoppingBag', label: 'Grocery Bag', component: ShoppingBag },
  { name: 'Package', label: 'Packaged Goods', component: Package }
];

const PRESET_IMAGES = [
  { label: 'Fruits & Veg', path: '/categories/vegetables_fruits_card.png' },
  { label: 'Rice & Grains', path: '/categories/rice_dal_grains_card.png' },
  { label: 'Cooking Essentials', path: '/categories/cooking_essentials_card.png' },
  { label: 'Dairy & Eggs', path: '/categories/dairy_eggs_card.png' },
  { label: 'Bakery', path: '/categories/bakery_breakfast_card.png' },
  { label: 'Snacks & Drinks', path: '/categories/snacks_beverages_card.png' },
  { label: 'Personal Care', path: '/categories/personal_care_card.png' },
  { label: 'Household', path: '/categories/household_items_card.png' },
  { label: 'Baby Care', path: '/categories/baby_care_card.png' },
  { label: 'Health & Wellness', path: '/categories/health_wellness_card.png' }
];

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  category,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [cardImage, setCardImage] = useState('/categories/vegetables_fruits_card.png');
  const [icon, setIcon] = useState('Apple');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [subcategories, setSubcategories] = useState<CategorySubcategory[]>([]);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || '');
      setCardImage(category.cardImage || '/categories/vegetables_fruits_card.png');
      setIcon(category.icon || 'Apple');
      setDisplayOrder(category.displayOrder ?? 1);
      setIsActive(category.isActive ?? true);
      setSubcategories(category.subcategories ? [...category.subcategories] : []);
    } else {
      // Defaults for new category
      setName('');
      setSlug('');
      setDescription('');
      setCardImage('/categories/vegetables_fruits_card.png');
      setIcon('Apple');
      setDisplayOrder(11);
      setIsActive(true);
      setSubcategories([]);
    }
    setError(null);
  }, [category, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-update slug if we are creating a new category or slug matches previous slugification
    if (!category || slug === category.slug) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const handleAddSubcategory = () => {
    const raw = newSubcategoryName.trim();
    if (!raw) return;

    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    const newItems: CategorySubcategory[] = [];

    for (const part of parts) {
      const subSlug = part.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (
        !subcategories.some(s => s.name.toLowerCase() === part.toLowerCase()) &&
        !newItems.some(s => s.name.toLowerCase() === part.toLowerCase())
      ) {
        newItems.push({ name: part, slug: subSlug });
      }
    }

    if (newItems.length === 0) {
      setError('Subcategory already exists or invalid.');
      return;
    }

    setSubcategories(prev => [...prev, ...newItems]);
    setNewSubcategoryName('');
    setError(null);
  };

  const handleRemoveSubcategory = (index: number) => {
    setSubcategories(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCardImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const generatedSlug = slug.trim()
        ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

      await onSave({
        name: name.trim(),
        slug: generatedSlug,
        description: description.trim(),
        cardImage,
        prodImage: cardImage,
        icon,
        displayOrder: Number(displayOrder) || 1,
        isActive,
        subcategories
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {category ? 'Edit Category' : 'Add New Category'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure grocery department details, icon, and subcategories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Fruits & Vegetables"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Slug (URL Identifier)
              </label>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="fruits-vegetables"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Row 2: Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of products in this department..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition resize-none"
            />
          </div>

          {/* Row 3: Display Order & Status Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={displayOrder}
                onChange={e => setDisplayOrder(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Order displayed on homepage & navigation</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category Status
              </label>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl h-[42px]">
                <span className={`text-xs font-bold ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {isActive ? 'Active (Visible in Store)' : 'Disabled (Hidden)'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    isActive ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      isActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Row 4: Category Icon Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category Icon
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map(item => {
                const IconComponent = item.component;
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/80 text-brand-700 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold truncate max-w-full">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 5: Category Image */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Category Image
              </label>
              <span className="text-[11px] text-slate-400">Card & Department Graphic</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 overflow-hidden shrink-0 shadow-xs">
                {cardImage ? (
                  <img src={cardImage} alt="Category preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="text"
                  value={cardImage}
                  onChange={e => setCardImage(e.target.value)}
                  placeholder="Image URL or preset path"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 focus:outline-hidden"
                />

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5 shadow-2xs transition">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                  </label>
                  <span className="text-[11px] text-slate-400">or choose from library below</span>
                </div>
              </div>
            </div>

            {/* Preset Image Swatches */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESET_IMAGES.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCardImage(img.path)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                    cardImage === img.path
                      ? 'bg-brand-100 border-brand-400 text-brand-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 6: Subcategories */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Subcategories ({subcategories.length})
              </label>
              <span className="text-[11px] text-slate-400">Used for shelf filters & product tags</span>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSubcategoryName}
                onChange={e => setNewSubcategoryName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubcategory();
                  }
                }}
                placeholder="e.g. Leafy Greens, Exotic Fruits..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddSubcategory}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Subcategories Chips */}
            <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {subcategories.length === 0 ? (
                <span className="text-xs text-slate-400 italic py-0.5 px-1">
                  No subcategories added yet. Type above and press Add.
                </span>
              ) : (
                subcategories.map((sub, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 shadow-2xs group"
                  >
                    <span>{sub.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcategory(idx)}
                      className="text-slate-400 hover:text-rose-600 transition"
                      title="Remove subcategory"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{category ? 'Save Changes' : 'Create Category'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
