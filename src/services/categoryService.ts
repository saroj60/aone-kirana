export interface CategorySubcategory {
  id?: string;
  name: string;
  slug: string;
}

export interface AdminCategory {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description: string;
  cardImage: string;
  prodImage?: string;
  icon: string;
  bgColor: string;
  badgeColor: string;
  displayOrder: number;
  isActive: boolean;
  itemCount: string;
  filterKey: string;
  subcategories: CategorySubcategory[];
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'aone_admin_categories_v1';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Initial 10 Main Categories seeded for Aone Kirana
export const INITIAL_CATEGORIES: AdminCategory[] = [
  {
    id: 'cat-01',
    name: 'Fruits & Vegetables',
    slug: 'fruits-vegetables',
    description: 'Farm-fresh seasonal fruits, daily fresh vegetables, green leafy herbs, and organic produce.',
    cardImage: '/categories/vegetables_fruits_card.png',
    prodImage: '/categories/vegetables_fruits_prod.png',
    icon: 'Apple',
    bgColor: 'bg-[#eaf8ee]',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    displayOrder: 1,
    isActive: true,
    itemCount: '120+ Items',
    filterKey: 'Vegetables',
    subcategories: [
      { name: 'Fresh Vegetables', slug: 'fresh-vegetables' },
      { name: 'Fresh Fruits', slug: 'fresh-fruits' },
      { name: 'Leafy Greens', slug: 'leafy-greens' },
      { name: 'Root Vegetables', slug: 'root-vegetables' },
      { name: 'Salads & Herbs', slug: 'salads-herbs' },
      { name: 'Exotic Fruits', slug: 'exotic-fruits' }
    ]
  },
  {
    id: 'cat-02',
    name: 'Rice, Dal & Grains',
    slug: 'rice-dal-grains',
    description: 'Premium basmati rice, organic pulses, fresh atta, unpolished lentils, and local grain varieties.',
    cardImage: '/categories/rice_dal_grains_card.png',
    prodImage: '/categories/rice_dal_grains_prod.png',
    icon: 'Wheat',
    bgColor: 'bg-[#fbf4e8]',
    badgeColor: 'bg-amber-100 text-amber-800',
    displayOrder: 2,
    isActive: true,
    itemCount: '80+ Items',
    filterKey: 'Grains',
    subcategories: [
      { name: 'Basmati Rice', slug: 'basmati-rice' },
      { name: 'Daily Rice (Jeera Masino)', slug: 'daily-rice' },
      { name: 'Dal & Pulses', slug: 'dal-pulses' },
      { name: 'Atta & Flours', slug: 'atta-flours' },
      { name: 'Grains & Millets', slug: 'grains-millets' },
      { name: 'Poha & Beaten Rice', slug: 'poha' }
    ]
  },
  {
    id: 'cat-03',
    name: 'Cooking Essentials',
    slug: 'cooking-essentials',
    description: 'Pure mustard oil, cow ghee, whole spices, iodized salt, sugar, culinary pastes, and curry powders.',
    cardImage: '/categories/cooking_essentials_card.png',
    prodImage: '/categories/cooking_essentials_prod.png',
    icon: 'Flame',
    bgColor: 'bg-[#fdeef0]',
    badgeColor: 'bg-rose-100 text-rose-800',
    displayOrder: 3,
    isActive: true,
    itemCount: '150+ Items',
    filterKey: 'Essentials',
    subcategories: [
      { name: 'Cooking Oils', slug: 'cooking-oils' },
      { name: 'Mustard Oil & Pure Ghee', slug: 'mustard-oil-ghee' },
      { name: 'Spices & Masalas', slug: 'spices-masalas' },
      { name: 'Salt & Sugar', slug: 'salt-sugar' },
      { name: 'Whole Spices', slug: 'whole-spices' },
      { name: 'Sauces & Pastes', slug: 'sauces-pastes' }
    ]
  },
  {
    id: 'cat-04',
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    description: 'Fresh cow milk, local farm eggs, butter, fresh dahi, paneer, and rich cream cheese.',
    cardImage: '/categories/dairy_eggs_card.png',
    prodImage: '/categories/dairy_eggs_prod.png',
    icon: 'Milk',
    bgColor: 'bg-[#edf6fc]',
    badgeColor: 'bg-sky-100 text-sky-800',
    displayOrder: 4,
    isActive: true,
    itemCount: '60+ Items',
    filterKey: 'Dairy',
    subcategories: [
      { name: 'Fresh Milk', slug: 'fresh-milk' },
      { name: 'Local Farm Eggs', slug: 'local-eggs' },
      { name: 'Butter & Spreads', slug: 'butter' },
      { name: 'Curd & Dahi', slug: 'curd-dahi' },
      { name: 'Fresh Paneer', slug: 'fresh-paneer' },
      { name: 'Cheese Slices', slug: 'cheese-slices' }
    ]
  },
  {
    id: 'cat-05',
    name: 'Bakery & Breakfast',
    slug: 'bakery-breakfast',
    description: 'Brown breads, sandwich loaves, morning cereals, oats, rusks, cookies, and fruit jams.',
    cardImage: '/categories/bakery_breakfast_card.png',
    prodImage: '/categories/bakery_breakfast_prod.png',
    icon: 'Croissant',
    bgColor: 'bg-[#fdf3ec]',
    badgeColor: 'bg-orange-100 text-orange-800',
    displayOrder: 5,
    isActive: true,
    itemCount: '100+ Items',
    filterKey: 'Bakery',
    subcategories: [
      { name: 'Breads & Buns', slug: 'breads-buns' },
      { name: 'Rusks & Toast', slug: 'rusks-toast' },
      { name: 'Breakfast Cereals & Cornflakes', slug: 'cereals' },
      { name: 'Oats & Muesli', slug: 'oats-muesli' },
      { name: 'Jams & Honey', slug: 'jams-honey' },
      { name: 'Cakes & Muffins', slug: 'cakes-muffins' }
    ]
  },
  {
    id: 'cat-06',
    name: 'Snacks & Beverages',
    slug: 'snacks-beverages',
    description: 'Crispy potato chips, premium CTC tea, instant coffee, juices, noodles, and authentic namkeen.',
    cardImage: '/categories/snacks_beverages_card.png',
    prodImage: '/categories/snacks_beverages_prod.png',
    icon: 'Coffee',
    bgColor: 'bg-[#eff0fc]',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    displayOrder: 6,
    isActive: true,
    itemCount: '200+ Items',
    filterKey: 'Snacks',
    subcategories: [
      { name: 'Chips & Crisps', slug: 'chips-crisps' },
      { name: 'CTC Tea & Leaf Blends', slug: 'tea-chai' },
      { name: 'Instant Coffee', slug: 'instant-coffee' },
      { name: 'Cold Drinks & Fruit Juices', slug: 'cold-drinks-juices' },
      { name: 'Biscuits & Cookies', slug: 'biscuits-cookies' },
      { name: 'Bhujia & Dalmoth', slug: 'bhujia-dalmoth' }
    ]
  },
  {
    id: 'cat-07',
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Moisturizing bath soaps, herbal shampoos, toothpastes, skincare lotions, and hygiene essentials.',
    cardImage: '/categories/personal_care_card.png',
    prodImage: '/categories/personal_care_prod.png',
    icon: 'Sparkles',
    bgColor: 'bg-[#eaf7f2]',
    badgeColor: 'bg-teal-100 text-teal-800',
    displayOrder: 7,
    isActive: true,
    itemCount: '120+ Items',
    filterKey: 'PersonalCare',
    subcategories: [
      { name: 'Soaps & Body Wash', slug: 'soaps-bodywash' },
      { name: 'Hair Care & Shampoos', slug: 'hair-care' },
      { name: 'Oral Care & Toothpastes', slug: 'oral-care' },
      { name: 'Skin Care & Moisturizers', slug: 'skin-care' },
      { name: 'Deodorants & Fragrances', slug: 'deodorants' },
      { name: 'Hand Sanitizers & Washes', slug: 'hand-sanitizers' }
    ]
  },
  {
    id: 'cat-08',
    name: 'Household Items',
    slug: 'household-items',
    description: 'Laundry detergents, surface cleaners, dishwash bars, garbage bags, tissues, and pooja supplies.',
    cardImage: '/categories/household_items_card.png',
    prodImage: '/categories/household_items_prod.png',
    icon: 'Home',
    bgColor: 'bg-[#fdf8eb]',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    displayOrder: 8,
    isActive: true,
    itemCount: '100+ Items',
    filterKey: 'Household',
    subcategories: [
      { name: 'Detergent Powders & Liquids', slug: 'detergents' },
      { name: 'Floor & Glass Cleaners', slug: 'cleaners' },
      { name: 'Dishwash Bars & Gels', slug: 'dishwash' },
      { name: 'Pooja Essentials & Incense', slug: 'pooja-essentials' },
      { name: 'Kitchen Towels & Foil', slug: 'kitchen-towels' },
      { name: 'Mosquito Repellents', slug: 'repellents' }
    ]
  },
  {
    id: 'cat-09',
    name: 'Baby Care',
    slug: 'baby-care',
    description: 'Ultra-absorbent baby diapers, soft baby wipes, baby milk formulas, baby shampoos, and lotions.',
    cardImage: '/categories/baby_care_card.png',
    prodImage: '/categories/baby_care_prod.png',
    icon: 'Baby',
    bgColor: 'bg-[#fdeff4]',
    badgeColor: 'bg-pink-100 text-pink-800',
    displayOrder: 9,
    isActive: true,
    itemCount: '80+ Items',
    filterKey: 'BabyCare',
    subcategories: [
      { name: 'Diaper Pants & Taped', slug: 'baby-diapers' },
      { name: 'Baby Wipes & Cleansing', slug: 'baby-wipes' },
      { name: 'Baby Nutrition & Cereals', slug: 'baby-nutrition' },
      { name: 'Baby Bath & Gentle Care', slug: 'baby-bath' },
      { name: 'Baby Lotions & Powders', slug: 'baby-lotions' },
      { name: 'Teethers & Feeding Bottles', slug: 'baby-accessories' }
    ]
  },
  {
    id: 'cat-10',
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Chyawanprash, herbal digestive drops, green teas, vitamin supplements, and first-aid supplies.',
    cardImage: '/categories/health_wellness_card.png',
    prodImage: '/categories/health_wellness_prod.png',
    icon: 'HeartPulse',
    bgColor: 'bg-[#eef8f1]',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    displayOrder: 10,
    isActive: true,
    itemCount: '90+ Items',
    filterKey: 'Essentials',
    subcategories: [
      { name: 'Chyawanprash & Immunity', slug: 'immunity-boosters' },
      { name: 'Ayurvedic Syrups & Juices', slug: 'ayurvedic-syrups' },
      { name: 'Herbal Green Teas', slug: 'green-teas' },
      { name: 'Daily Nutrition & Proteins', slug: 'nutrition-proteins' },
      { name: 'First Aid & Antiseptics', slug: 'first-aid' },
      { name: 'Pain Relief Balms & Sprays', slug: 'pain-relief' }
    ]
  }
];

class CategoryService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('aone_admin_jwt_token') || sessionStorage.getItem('aone_admin_jwt_token');
    if (token) return { Authorization: `Bearer ${token}` };
    return {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsInJvbGUiOiJhZG1pbiJ9.mock_jwt_signature`
    };
  }

  /**
   * Fetch all categories with optional search and status filters
   */
  async getCategories(options?: { search?: string; status?: 'all' | 'active' | 'disabled' }): Promise<AdminCategory[]> {
    // 1. Try Live Express Backend
    try {
      const queryParams = new URLSearchParams();
      if (options?.search) queryParams.set('search', options.search);
      if (options?.status && options.status !== 'all') queryParams.set('status', options.status);

      const res = await fetch(`${API_BASE_URL}/categories?${queryParams.toString()}`, {
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: AdminCategory[] = data.data.map((cat: any) => ({
            ...cat,
            id: cat._id || cat.id
          }));

          // Merge backend categories with any local categories to preserve custom additions
          const localCats = this.getFromStorage();
          const merged = [...mapped];
          for (const loc of localCats) {
            if (!merged.some(m => m.id === loc.id || m.name.toLowerCase() === loc.name.toLowerCase() || m.slug === loc.slug)) {
              merged.push(loc);
            }
          }

          this.saveToStorage(merged);
          return merged;
        }
      }
    } catch (err) {
      console.warn('Backend categories unreachable, utilizing local store:', err);
    }

    // 2. Local Storage Fallback
    let categories = this.getFromStorage();
    if (!categories || categories.length === 0) {
      categories = [...INITIAL_CATEGORIES];
      this.saveToStorage(categories);
    }

    // Filter by status
    if (options?.status === 'active') {
      categories = categories.filter(c => c.isActive);
    } else if (options?.status === 'disabled') {
      categories = categories.filter(c => !c.isActive);
    }

    // Filter by search query
    if (options?.search && options.search.trim()) {
      const term = options.search.toLowerCase().trim();
      categories = categories.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.subcategories.some(s => s.name.toLowerCase().includes(term))
      );
    }

    // Sort by display order
    return categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: Partial<AdminCategory>): Promise<AdminCategory> {
    const slug = categoryData.slug?.trim() || categoryData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'category';
    
    // 1. Attempt API
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify(categoryData)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.data) {
        const newCat = { ...data.data, id: data.data._id || data.data.id };
        const existing = this.getFromStorage();
        this.saveToStorage([...existing.filter(c => c.id !== newCat.id), newCat]);
        return newCat;
      } else if (!res.ok && data.message) {
        throw new Error(data.message);
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      console.warn('Backend category creation failed, using local storage fallback:', err);
    }

    // 2. Local Fallback
    const existing = this.getFromStorage();
    const newOrder = existing.length > 0 ? Math.max(...existing.map(c => c.displayOrder || 0)) + 1 : 1;

    const newCategory: AdminCategory = {
      id: `cat-${Date.now().toString().slice(-4)}`,
      name: categoryData.name || 'New Category',
      slug,
      description: categoryData.description || '',
      cardImage: categoryData.cardImage || '/categories/vegetables_fruits_card.png',
      prodImage: categoryData.prodImage || categoryData.cardImage || '/categories/vegetables_fruits_prod.png',
      icon: categoryData.icon || 'Grid',
      bgColor: categoryData.bgColor || 'bg-[#eaf8ee]',
      badgeColor: categoryData.badgeColor || 'bg-emerald-100 text-emerald-800',
      displayOrder: categoryData.displayOrder ?? newOrder,
      isActive: categoryData.isActive ?? true,
      itemCount: categoryData.itemCount || '0 Items',
      filterKey: categoryData.filterKey || categoryData.name || 'Essentials',
      subcategories: categoryData.subcategories || []
    };

    const updated = [...existing.filter(c => c.id !== newCategory.id), newCategory].sort((a, b) => a.displayOrder - b.displayOrder);
    this.saveToStorage(updated);
    return newCategory;
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: string, updates: Partial<AdminCategory>): Promise<AdminCategory> {
    // 1. Attempt API
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.data) {
        const updatedCat = { ...data.data, id: data.data._id || data.data.id };
        const list = this.getFromStorage().map(c => (c.id === id || c._id === id ? updatedCat : c));
        this.saveToStorage(list);
        return updatedCat;
      }
    } catch (err) {
      console.warn('Backend category update failed, updating local storage:', err);
    }

    // 2. Local fallback
    const list = this.getFromStorage();
    let updatedItem: AdminCategory | null = null;
    const newList = list.map(c => {
      if (c.id === id || c._id === id) {
        updatedItem = { ...c, ...updates };
        return updatedItem;
      }
      return c;
    });

    if (!updatedItem) {
      throw new Error(`Category with ID ${id} not found.`);
    }

    this.saveToStorage(newList);
    return updatedItem;
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<boolean> {
    // 1. Attempt API
    try {
      await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { ...this.getAuthHeader() }
      });
    } catch (err) {
      console.warn('Backend category deletion failed, deleting from local storage:', err);
    }

    // 2. Local fallback
    const list = this.getFromStorage().filter(c => c.id !== id && c._id !== id);
    this.saveToStorage(list);
    return true;
  }

  /**
   * Toggle Active / Disabled status
   */
  async toggleStatus(id: string): Promise<AdminCategory> {
    // 1. Attempt API
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}/status`, {
        method: 'PATCH',
        headers: { ...this.getAuthHeader() }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const updatedCat = { ...data.data, id: data.data._id || data.data.id };
          const list = this.getFromStorage().map(c => (c.id === id || c._id === id ? updatedCat : c));
          this.saveToStorage(list);
          return updatedCat;
        }
      }
    } catch (err) {
      console.warn('Backend status toggle failed, toggling locally:', err);
    }

    // 2. Local fallback
    const list = this.getFromStorage();
    let updatedItem: AdminCategory | null = null;
    const newList = list.map(c => {
      if (c.id === id || c._id === id) {
        updatedItem = { ...c, isActive: !c.isActive };
        return updatedItem;
      }
      return c;
    });

    if (!updatedItem) throw new Error('Category not found');
    this.saveToStorage(newList);
    return updatedItem;
  }

  /**
   * Reorder categories (move up or down)
   */
  async reorder(orderList: { id: string; displayOrder: number }[]): Promise<AdminCategory[]> {
    // 1. Attempt API
    try {
      const res = await fetch(`${API_BASE_URL}/categories/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify({ orderList })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const mapped = data.data.map((c: any) => ({ ...c, id: c._id || c.id }));
          this.saveToStorage(mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn('Backend reorder failed, saving locally:', err);
    }

    // 2. Local fallback
    const list = this.getFromStorage();
    const orderMap = new Map(orderList.map(o => [o.id, o.displayOrder]));
    const updated = list.map(c => ({
      ...c,
      displayOrder: orderMap.get(c.id) ?? orderMap.get(c._id || '') ?? c.displayOrder
    })).sort((a, b) => a.displayOrder - b.displayOrder);

    this.saveToStorage(updated);
    return updated;
  }

  /**
   * Reset to initial defaults if needed
   */
  resetToDefaults(): AdminCategory[] {
    this.saveToStorage(INITIAL_CATEGORIES);
    return INITIAL_CATEGORIES;
  }

  private getFromStorage(): AdminCategory[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveToStorage(INITIAL_CATEGORIES);
        return [...INITIAL_CATEGORIES];
      }
      return JSON.parse(raw);
    } catch (e) {
      return [...INITIAL_CATEGORIES];
    }
  }

  private saveToStorage(categories: AdminCategory[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage', e);
    }
  }
}

export const categoryService = new CategoryService();
