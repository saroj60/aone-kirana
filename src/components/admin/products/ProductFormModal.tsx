import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Upload, Check, AlertCircle, Trash2, Sparkles, FolderUp, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { Product } from '../../../data/mockData';

interface ProductFormModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
  onDelete?: (productId: string) => void;
  categories?: string[];
}

// Preset grocery items for rapid catalog adding
const PRESET_GROCERY_TEMPLATES = [
  {
    name: 'Red Onions (Fresh)',
    category: 'Vegetables',
    unit: '1 kg',
    price: 60,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80',
    description: 'Crisp, pungent red onions harvested fresh. Ideal for daily cooking base.'
  },
  {
    name: 'Local Fresh Tomatoes',
    category: 'Vegetables',
    unit: '1 kg',
    price: 50,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
    description: 'Farm-fresh juicy vine-ripened red tomatoes for curry and salads.'
  },
  {
    name: 'Fresh Hill Potatoes',
    category: 'Vegetables',
    unit: '1 kg',
    price: 45,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80',
    description: 'Firm and wholesome golden potatoes straight from local hill farms.'
  },
  {
    name: 'Sweet Bananas (Robusta)',
    category: 'Fruits',
    unit: '1 Dozen',
    price: 120,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80',
    description: 'Sweet, energy-rich ripe robusta bananas.'
  },
  {
    name: 'Crisp Red Apples',
    category: 'Fruits',
    unit: '1 kg',
    price: 180,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
    description: 'Juicy, crisp sweet Mustang hill apples.'
  },
  {
    name: 'Pure Cow Milk (Pasteurized)',
    category: 'Dairy',
    unit: '1 liter',
    price: 95,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    description: 'Pure, fresh, high-protein wholesome cow milk.'
  },
  {
    name: 'Premium Basmati Rice',
    category: 'Grains',
    unit: '5 kg',
    price: 580,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    description: 'Aromatic long-grain aged basmati rice for biryani and daily meals.'
  },
  {
    name: 'Cold Pressed Sunflower Oil',
    category: 'Essentials',
    unit: '1 liter',
    price: 240,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    description: 'Light, healthy cold-pressed pure refined cooking oil.'
  },
  {
    name: 'Whole Wheat Chakki Atta',
    category: 'Grains',
    unit: '5 kg',
    price: 360,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    description: '100% whole grain stone-ground nutritious wheat flour.'
  },
  {
    name: 'Fresh Brown Bread',
    category: 'Bakery',
    unit: '400 g',
    price: 85,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    description: 'Soft, oven-fresh high fiber brown bread.'
  }
];

const STANDARD_UNITS = ['1 kg', '500 g', '250 g', '1 pc', '1 Dozen', 'Pack of 2', 'Pack of 4', '1 liter', '500 ml', '5 kg', '10 kg'];

const DEFAULT_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Dairy',
  'Grains',
  'Essentials',
  'Snacks',
  'Bakery',
  'Household',
  'PersonalCare',
  'BabyCare',
  'Meat',
  'Instant',
  'Sauces',
  'Kitchenware'
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  product,
  onClose,
  onSave,
  onDelete,
  categories = DEFAULT_CATEGORIES
}) => {
  const isEditMode = Boolean(product);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [subCategory, setSubCategory] = useState('');
  const [unit, setUnit] = useState('1 kg');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [image, setImage] = useState('');
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url'>('upload');
  const [localImageName, setLocalImageName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState('');
  const [inStock, setInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [packSizes, setPackSizes] = useState('');
  const [rating, setRating] = useState('4.8');
  const [reviewsCount, setReviewsCount] = useState('24');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Filter available categories to remove 'all'
  const cleanCategories = Array.from(new Set(
    (categories || DEFAULT_CATEGORIES).filter(c => c.toLowerCase() !== 'all')
  ));

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category || 'Vegetables');
      setSubCategory(product.subCategory || '');
      setUnit(product.unit || '1 kg');
      setPrice(product.price ? product.price.toString() : '');
      setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
      setImage(product.image || '');
      // Determine if image is local base64 or url
      if (product.image && product.image.startsWith('data:image')) {
        setImageSourceMode('upload');
        setLocalImageName('Stored Local Image');
      } else {
        setImageSourceMode(product.image ? 'url' : 'upload');
        setLocalImageName('');
      }
      setDescription(product.description || '');
      setInStock(product.inStock !== false);
      setIsFeatured(Boolean(product.isFeatured));
      setPackSizes(product.packSizes ? product.packSizes.join(', ') : '');
      setRating(product.rating ? product.rating.toString() : '4.8');
      setReviewsCount(product.reviewsCount ? product.reviewsCount.toString() : '24');
    } else {
      setName('');
      setCategory(cleanCategories[0] || 'Vegetables');
      setSubCategory('');
      setUnit('1 kg');
      setPrice('');
      setOriginalPrice('');
      setImage('');
      setImageSourceMode('upload');
      setLocalImageName('');
      setDescription('');
      setInStock(true);
      setIsFeatured(false);
      setPackSizes('500 g, 1 kg, 2 kg');
      setRating('4.8');
      setReviewsCount('12');
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Process and optimize image file from local storage / disk
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select an image file (PNG, JPG, JPEG, WEBP).' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimize dimensions to maximum 800x800 for optimal performance & storage
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.85);
          setImage(compressedDataUrl);
          setLocalImageName(file.name);
          setErrors(prev => {
            const next = { ...prev };
            delete next.image;
            return next;
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Handle Preset Click
  const handleApplyPreset = (template: typeof PRESET_GROCERY_TEMPLATES[0]) => {
    setName(template.name);
    setCategory(template.category);
    setUnit(template.unit);
    setPrice(template.price.toString());
    setImage(template.image);
    setImageSourceMode('url');
    setLocalImageName('');
    setDescription(template.description);
    if (!originalPrice) {
      setOriginalPrice(Math.round(template.price * 1.15).toString());
    }
  };

  const handleValidate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!category.trim()) newErrors.category = 'Category is required';
    if (!unit.trim()) newErrors.unit = 'Unit is required';

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Please enter a valid price (greater than 0)';
    }

    if (originalPrice.trim()) {
      const numOriginal = parseFloat(originalPrice);
      if (isNaN(numOriginal) || numOriginal < 0) {
        newErrors.originalPrice = 'Original price must be a valid number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidate()) return;

    const numPrice = parseFloat(price);
    const numOriginalPrice = originalPrice.trim() ? parseFloat(originalPrice) : undefined;
    
    let discountPercentage: number | undefined = undefined;
    if (numOriginalPrice && numOriginalPrice > numPrice) {
      discountPercentage = Math.round(((numOriginalPrice - numPrice) / numOriginalPrice) * 100);
    }

    const packSizesArray = packSizes
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';

    const savedProduct: Product = {
      id: product?.id || `prod-${Date.now()}`,
      name: name.trim(),
      category: category as any,
      subCategory: (subCategory.trim() || undefined) as any,
      unit: unit.trim(),
      price: numPrice,
      originalPrice: numOriginalPrice,
      discountPercentage,
      image: image.trim() || fallbackImage,
      description: description.trim() || `${name.trim()} - fresh and authentic quality from Aone Kirana.`,
      inStock,
      isFeatured,
      rating: parseFloat(rating) || 4.8,
      reviewsCount: parseInt(reviewsCount) || 15,
      packSizes: packSizesArray.length > 0 ? packSizesArray : [unit.trim()]
    };

    onSave(savedProduct);
    onClose();
  };

  const calculatedDiscount = originalPrice && price && parseFloat(originalPrice) > parseFloat(price)
    ? Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)
    : null;

  const isLocalImage = image.startsWith('data:image');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditMode ? `Update details for "${product?.name}"` : 'Publish a new grocery product to customer storefront'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {/* Preset Grocery Quick-Picks (Only on Create mode or if requested) */}
          {!isEditMode && (
            <div className="p-3.5 bg-brand-50/60 rounded-2xl border border-brand-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  Quick Presets (Click to autofill):
                </span>
                <span className="text-[11px] text-brand-600 font-medium">1-Click Fill</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {PRESET_GROCERY_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPreset(tpl)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-brand-100/70 border border-brand-200/70 rounded-xl text-xs font-semibold text-slate-700 whitespace-nowrap active:scale-95 transition shadow-xs"
                  >
                    <img src={tpl.image} alt={tpl.name} className="w-4 h-4 rounded-full object-cover" />
                    <span>{tpl.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Fresh Red Onions, Amul Butter, Basmati Rice"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-hidden focus:ring-2 transition ${
                errors.name ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-200 bg-slate-50/50 focus:bg-white'
              }`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.name}</p>}
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
              >
                {cleanCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Unit / Measure <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="e.g. 1 kg, 500 g, 1 pc"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-hidden focus:ring-2 transition ${
                    errors.unit ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-200 bg-slate-50/50 focus:bg-white'
                  }`}
                />
              </div>
              {/* Unit suggestions */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {STANDARD_UNITS.slice(0, 5).map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                      unit === u ? 'bg-brand-700 text-white border-brand-700' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing: Price and Original Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Selling Price (Rs.) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="e.g. 120"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-bold focus:outline-hidden focus:ring-2 transition ${
                    errors.price ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-200 bg-slate-50/50 focus:bg-white'
                  }`}
                />
              </div>
              {errors.price && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.price}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Original Price / MRP (Optional)
                </label>
                {calculatedDiscount !== null && (
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {calculatedDiscount}% OFF
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={originalPrice}
                  onChange={e => setOriginalPrice(e.target.value)}
                  placeholder="e.g. 150 (Shows strike-through)"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                />
              </div>
            </div>
          </div>

          {/* Product Image Section: Local Storage Upload & Web URL */}
          <div className="space-y-2.5 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-brand-700" />
                <span>Product Image</span>
              </label>

              {/* Source Switcher: Upload from Device vs Web URL */}
              <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setImageSourceMode('upload')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                    imageSourceMode === 'upload'
                      ? 'bg-brand-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FolderUp className="w-3.5 h-3.5" />
                  <span>From Device / Local</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceMode('url')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                    imageSourceMode === 'url'
                      ? 'bg-brand-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Web Link / URL</span>
                </button>
              </div>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload Area (Local Storage / Device) */}
            {imageSourceMode === 'upload' ? (
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-brand-500 bg-brand-50/80 scale-[1.01]'
                    : 'border-slate-300 hover:border-brand-400 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-100 shadow-2xs">
                  <FolderUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse files from your device
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    or drag and drop your grocery image here (PNG, JPG, WebP)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File from Local Storage</span>
                </button>
              </div>
            ) : (
              /* URL Input Field */
              <div>
                <input
                  type="url"
                  value={image}
                  onChange={e => {
                    setImage(e.target.value);
                    setLocalImageName('');
                  }}
                  placeholder="https://images.unsplash.com/... or paste image web link"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                />
              </div>
            )}

            {/* Image Preview & Details Card */}
            {image && (
              <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs mt-2">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-contain bg-slate-50 border border-slate-200 p-0.5 shrink-0"
                    onError={e => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 truncate block">
                        {localImageName || (image.length > 40 ? image.substring(0, 36) + '...' : image)}
                      </span>
                      {isLocalImage ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase shrink-0">
                          Local File
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[9px] font-black uppercase shrink-0">
                          Web Link
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">Ready to publish</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (imageSourceMode === 'upload') {
                        fileInputRef.current?.click();
                      } else {
                        setImage('');
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-brand-700 hover:bg-slate-100 rounded-lg transition"
                    title="Change image"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImage('');
                      setLocalImageName('');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {errors.image && <p className="text-[11px] text-rose-500 font-semibold">{errors.image}</p>}
          </div>

          {/* Pack Sizes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Available Pack Sizes (comma-separated)
            </label>
            <input
              type="text"
              value={packSizes}
              onChange={e => setPackSizes(e.target.value)}
              placeholder="e.g. 500 g, 1 kg, 2 kg, 5 kg"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Write a brief overview of freshness, quality, and origin..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition resize-none"
            />
          </div>

          {/* Toggle Switches: In Stock & Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div 
              onClick={() => setInStock(!inStock)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between select-none ${
                inStock ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
              }`}
            >
              <div>
                <span className="block text-xs font-bold text-slate-900">
                  {inStock ? 'In Stock (Available)' : 'Out of Stock (Unavailable)'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {inStock ? 'Customers can add to cart' : 'Badge will show Out of Stock'}
                </span>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${inStock ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                {inStock ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              </div>
            </div>

            <div 
              onClick={() => setIsFeatured(!isFeatured)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between select-none ${
                isFeatured ? 'bg-purple-50/70 border-purple-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <span className="block text-xs font-bold text-slate-900">
                  {isFeatured ? 'Featured on Home' : 'Standard Catalog'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {isFeatured ? 'Highlighted in top carousel' : 'Normal category listing'}
                </span>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isFeatured ? 'bg-purple-600 text-white' : 'bg-slate-300 text-white'}`}>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Delete Confirmation Box (when active) */}
          {showDeleteConfirm && isEditMode && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 animate-fadeIn">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-rose-900">
                    Are you sure you want to delete this product?
                  </h4>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    This will remove &quot;{product?.name}&quot; from the catalog immediately. This action cannot be undone.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (product && onDelete) {
                          onDelete(product.id);
                          onClose();
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl active:scale-95 transition"
                    >
                      Yes, Delete Forever
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <div>
            {isEditMode && onDelete && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete Product</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold active:scale-95 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Check className="w-4 h-4" />
              <span>{isEditMode ? 'Update Product' : 'Publish Product'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
