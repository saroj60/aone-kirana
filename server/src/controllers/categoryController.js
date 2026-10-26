import { Category } from '../models/Category.js';

// Seed initial 10 main categories if collection is empty
const INITIAL_MAIN_CATEGORIES = [
  {
    name: 'Fruits & Vegetables',
    slug: 'fruits-vegetables',
    description: 'Farm-fresh organic vegetables, seasonal fruits, and crisp salad greens.',
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
    name: 'Rice, Dal & Grains',
    slug: 'rice-dal-grains',
    description: 'Premium aromatic basmati, unpolished pulses, daily staples, and organic flours.',
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
    name: 'Cooking Essentials',
    slug: 'cooking-essentials',
    description: 'Pure cooking oils, ghee, aromatic whole and ground spices, salt, and sugar.',
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
      { name: 'Mustard Oil & Ghee', slug: 'mustard-oil-ghee' },
      { name: 'Spices & Masalas', slug: 'spices-masalas' },
      { name: 'Salt & Sugar', slug: 'salt-sugar' },
      { name: 'Whole Spices', slug: 'whole-spices' },
      { name: 'Sauces & Pastes', slug: 'sauces-pastes' }
    ]
  },
  {
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    description: 'Pasteurized toned milk, farm fresh eggs, butter, curd, and artisanal cottage cheese.',
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
      { name: 'Local Eggs', slug: 'local-eggs' },
      { name: 'Butter & Spreads', slug: 'butter' },
      { name: 'Curd & Dahi', slug: 'curd-dahi' },
      { name: 'Fresh Paneer', slug: 'fresh-paneer' },
      { name: 'Cheese Slices', slug: 'cheese-slices' }
    ]
  },
  {
    name: 'Bakery & Breakfast',
    slug: 'bakery-breakfast',
    description: 'Artisan breads, whole wheat sandwich loaves, muffins, cereals, and rusks.',
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
      { name: 'Fresh White & Brown Bread', slug: 'bread' },
      { name: 'Croissants & Buns', slug: 'croissants-buns' },
      { name: 'Muffins & Cakes', slug: 'muffins-cakes' },
      { name: 'Marie & Tea Biscuits', slug: 'biscuits' },
      { name: 'Corn Flakes & Oats', slug: 'cereals' },
      { name: 'Fruit Jams & Spreads', slug: 'jams' }
    ]
  },
  {
    name: 'Snacks & Beverages',
    slug: 'snacks-beverages',
    description: 'Quick instant noodles, crunchy crisps, tea, coffee, and chilled refreshments.',
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
      { name: 'Instant Noodles & Soups', slug: 'instant-noodles' },
      { name: 'Chips & Namkeen', slug: 'chips-namkeen' },
      { name: 'Soft Drinks & Juices', slug: 'drinks-juices' },
      { name: 'Tea & Coffee', slug: 'tea-coffee' },
      { name: 'Chocolates & Sweets', slug: 'chocolates' }
    ]
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Premium body wash, shampoos, oral hygiene, moisturizing lotions, and soaps.',
    cardImage: '/categories/personal_care_card.png',
    prodImage: '/categories/personal_care_prod.png',
    icon: 'Heart',
    bgColor: 'bg-[#eaf7f2]',
    badgeColor: 'bg-teal-100 text-teal-800',
    displayOrder: 7,
    isActive: true,
    itemCount: '120+ Items',
    filterKey: 'PersonalCare',
    subcategories: [
      { name: 'Body Wash & Soaps', slug: 'body-wash-soaps' },
      { name: 'Shampoos & Haircare', slug: 'shampoos' },
      { name: 'Toothpaste & Oral Care', slug: 'oral-care' },
      { name: 'Skin Creams & Lotions', slug: 'skin-creams' },
      { name: 'Men’s Grooming & Shaving', slug: 'mens-grooming' }
    ]
  },
  {
    name: 'Household Items',
    slug: 'household-items',
    description: 'Tough stain detergents, dishwashing liquids, surface disinfectants, and paper rolls.',
    cardImage: '/categories/household_items_card.png',
    prodImage: '/categories/household_items_prod.png',
    icon: 'Sparkles',
    bgColor: 'bg-[#fdf8eb]',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    displayOrder: 8,
    isActive: true,
    itemCount: '100+ Items',
    filterKey: 'Household',
    subcategories: [
      { name: 'Laundry Detergents', slug: 'laundry-detergents' },
      { name: 'Dishwash Liquids & Bars', slug: 'dishwash' },
      { name: 'Toilet & Surface Cleaners', slug: 'toilet-cleaners' },
      { name: 'Tissues & Paper Towels', slug: 'paper-products' },
      { name: 'Garbage Bags & Bins', slug: 'garbage-bags' },
      { name: 'Air Fresheners', slug: 'air-fresheners' }
    ]
  },
  {
    name: 'Baby Care',
    slug: 'baby-care',
    description: 'Hypoallergenic baby diapers, soft wet wipes, pediatric washes, and feeding bottles.',
    cardImage: '/categories/baby_care_card.png',
    prodImage: '/categories/baby_care_prod.png',
    icon: 'Smile',
    bgColor: 'bg-[#fdeff4]',
    badgeColor: 'bg-pink-100 text-pink-800',
    displayOrder: 9,
    isActive: true,
    itemCount: '80+ Items',
    filterKey: 'BabyCare',
    subcategories: [
      { name: 'Diapers & Pants', slug: 'diapers' },
      { name: 'Baby Wipes', slug: 'baby-wipes' },
      { name: 'Gentle Baby Wash', slug: 'baby-wash' },
      { name: 'Baby Lotions & Powders', slug: 'baby-lotions' },
      { name: 'Feeding Bottles', slug: 'feeding-bottles' },
      { name: 'Baby Formula & Nutrition', slug: 'baby-formula' }
    ]
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Nutritional supplements, herbal remedies, antiseptic essentials, and wellness products.',
    cardImage: '/categories/health_wellness_card.png',
    prodImage: '/categories/health_wellness_prod.png',
    icon: 'Shield',
    bgColor: 'bg-[#eef8f1]',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    displayOrder: 10,
    isActive: true,
    itemCount: '90+ Items',
    filterKey: 'Essentials',
    subcategories: [
      { name: 'Ayurvedic & Herbal Care', slug: 'ayurvedic-herbal' },
      { name: 'Immunity Boosters', slug: 'immunity-boosters' },
      { name: 'First Aid & Antiseptics', slug: 'first-aid' },
      { name: 'Protein & Health Drinks', slug: 'health-drinks' },
      { name: 'Pain Relief Sprays & Balms', slug: 'pain-relief' }
    ]
  }
];

/**
 * @desc Get all categories (sorted by displayOrder)
 * @route GET /api/categories
 */
export const getCategories = async (req, res) => {
  try {
    const { status, search } = req.query;

    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany(INITIAL_MAIN_CATEGORIES);
    }

    const query = {};
    if (status === 'active') query.isActive = true;
    if (status === 'disabled') query.isActive = false;

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
        { 'subcategories.name': { $regex: q, $options: 'i' } }
      ];
    }

    const categories = await Category.find(query).sort({ displayOrder: 1, createdAt: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get single category by ID or slug
 * @route GET /api/categories/:id
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }]
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Create new category
 * @route POST /api/categories
 * @access Private (Admin)
 */
export const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      cardImage,
      prodImage,
      icon,
      bgColor,
      badgeColor,
      displayOrder,
      isActive = true,
      subcategories = []
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const generatedSlug = slug && slug.trim()
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const existing = await Category.findOne({
      $or: [{ name: name.trim() }, { slug: generatedSlug }]
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category name or slug already exists' });
    }

    // Determine display order if not provided
    let order = displayOrder;
    if (order === undefined || order === null) {
      const highest = await Category.findOne().sort({ displayOrder: -1 });
      order = highest ? highest.displayOrder + 1 : 1;
    }

    const category = await Category.create({
      name: name.trim(),
      slug: generatedSlug,
      description: description || '',
      cardImage: cardImage || '/categories/vegetables_fruits_card.png',
      prodImage: prodImage || cardImage || '/categories/vegetables_fruits_prod.png',
      icon: icon || 'Grid',
      bgColor: bgColor || 'bg-[#eaf8ee]',
      badgeColor: badgeColor || 'bg-emerald-100 text-emerald-800',
      displayOrder: order,
      isActive,
      itemCount: '0+ Items',
      filterKey: name.trim(),
      subcategories: Array.isArray(subcategories)
        ? subcategories.map(s => ({
            name: typeof s === 'string' ? s : s.name,
            slug: typeof s === 'string' ? s.toLowerCase().replace(/[^a-z0-9]+/g, '-') : s.slug
          }))
        : []
    });

    res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update category
 * @route PUT /api/categories/:id
 * @access Private (Admin)
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.name && !updates.slug) {
      updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    if (updates.subcategories && Array.isArray(updates.subcategories)) {
      updates.subcategories = updates.subcategories.map(s => ({
        name: typeof s === 'string' ? s : s.name,
        slug: typeof s === 'string' ? s.toLowerCase().replace(/[^a-z0-9]+/g, '-') : s.slug
      }));
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: category, message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete category
 * @route DELETE /api/categories/:id
 * @access Private (Admin)
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: `Category "${category.name}" removed successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Toggle category active/disabled status
 * @route PATCH /api/categories/:id/status
 * @access Private (Admin)
 */
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json({
      success: true,
      data: category,
      message: `Category is now ${category.isActive ? 'Active' : 'Disabled'}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Reorder categories
 * @route PATCH /api/categories/reorder
 * @access Private (Admin)
 */
export const reorderCategories = async (req, res) => {
  try {
    const { orderList } = req.body; // Array of { id, displayOrder }

    if (!Array.isArray(orderList)) {
      return res.status(400).json({ success: false, message: 'orderList array is required' });
    }

    const updates = orderList.map(item =>
      Category.findByIdAndUpdate(item.id, { $set: { displayOrder: item.displayOrder } })
    );

    await Promise.all(updates);

    const reordered = await Category.find().sort({ displayOrder: 1 });
    res.json({ success: true, data: reordered, message: 'Categories reordered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
