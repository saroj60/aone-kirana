import categoryProductsJson from './categoryProducts.json';

export interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Essentials' | 'Snacks' | 'Dairy' | 'Bakery' | 'PersonalCare' | 'Household' | 'BabyCare' | 'Meat' | 'Kitchenware' | 'Instant' | 'Sauces' | 'IceCream' | (string & {});
  subCategory?: 'all' | 'fruits' | 'leafy' | 'root' | 'salad' | 'herbs' | 'exotic' | 'fresh-cuts' | (string & {});
  categoryId?: string;
  subcategoryId?: string;
  image: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  isFeatured?: boolean;
  description: string;
  packSizes?: string[];
}

export interface ExactCategory {
  id: string;
  name: string;
  count: string;
  cardImage: string;
  prodImage: string;
  bgColor: string;
  arrowBg: string;
  filterKey: string;
}

export const EXACT_CATEGORIES: ExactCategory[] = [
  {
    id: 'exact-veg-fruits',
    name: 'Vegetables & Fruits',
    count: '120+ Items',
    cardImage: '/categories/vegetables_fruits_card.png',
    prodImage: '/categories/vegetables_fruits_prod.png',
    bgColor: 'bg-[#eaf8ee]',
    arrowBg: 'bg-emerald-100/80 text-emerald-800',
    filterKey: 'Vegetables'
  },
  {
    id: 'exact-rice-dal-grains',
    name: 'Rice, Dal & Grains',
    count: '80+ Items',
    cardImage: '/categories/rice_dal_grains_card.png',
    prodImage: '/categories/rice_dal_grains_prod.png',
    bgColor: 'bg-[#fbf4e8]',
    arrowBg: 'bg-amber-100/80 text-amber-800',
    filterKey: 'Grains'
  },
  {
    id: 'exact-cooking-essentials',
    name: 'Cooking Essentials',
    count: '150+ Items',
    cardImage: '/categories/cooking_essentials_card.png',
    prodImage: '/categories/cooking_essentials_prod.png',
    bgColor: 'bg-[#fdeef0]',
    arrowBg: 'bg-rose-100/80 text-rose-800',
    filterKey: 'Essentials'
  },
  {
    id: 'exact-snacks-beverages',
    name: 'Snacks & Beverages',
    count: '200+ Items',
    cardImage: '/categories/snacks_beverages_card.png',
    prodImage: '/categories/snacks_beverages_prod.png',
    bgColor: 'bg-[#eff0fc]',
    arrowBg: 'bg-indigo-100/80 text-indigo-800',
    filterKey: 'Snacks'
  },
  {
    id: 'exact-dairy-eggs',
    name: 'Dairy & Eggs',
    count: '60+ Items',
    cardImage: '/categories/dairy_eggs_card.png',
    prodImage: '/categories/dairy_eggs_prod.png',
    bgColor: 'bg-[#edf6fc]',
    arrowBg: 'bg-sky-100/80 text-sky-800',
    filterKey: 'Dairy'
  },
  {
    id: 'exact-bakery-breakfast',
    name: 'Bakery & Breakfast',
    count: '100+ Items',
    cardImage: '/categories/bakery_breakfast_card.png',
    prodImage: '/categories/bakery_breakfast_prod.png',
    bgColor: 'bg-[#fdf3ec]',
    arrowBg: 'bg-orange-100/80 text-orange-800',
    filterKey: 'Bakery'
  },
  {
    id: 'exact-personal-care',
    name: 'Personal Care',
    count: '120+ Items',
    cardImage: '/categories/personal_care_card.png',
    prodImage: '/categories/personal_care_prod.png',
    bgColor: 'bg-[#eaf7f2]',
    arrowBg: 'bg-teal-100/80 text-teal-800',
    filterKey: 'PersonalCare'
  },
  {
    id: 'exact-household-items',
    name: 'Household Items',
    count: '100+ Items',
    cardImage: '/categories/household_items_card.png',
    prodImage: '/categories/household_items_prod.png',
    bgColor: 'bg-[#fdf8eb]',
    arrowBg: 'bg-yellow-100/80 text-yellow-800',
    filterKey: 'Household'
  },
  {
    id: 'exact-baby-care',
    name: 'Baby Care',
    count: '80+ Items',
    cardImage: '/categories/baby_care_card.png',
    prodImage: '/categories/baby_care_prod.png',
    bgColor: 'bg-[#fdeff4]',
    arrowBg: 'bg-pink-100/80 text-pink-800',
    filterKey: 'PersonalCare'
  },
  {
    id: 'exact-health-wellness',
    name: 'Health & Wellness',
    count: '90+ Items',
    cardImage: '/categories/health_wellness_card.png',
    prodImage: '/categories/health_wellness_prod.png',
    bgColor: 'bg-[#eef8f1]',
    arrowBg: 'bg-emerald-100/80 text-emerald-800',
    filterKey: 'Essentials'
  }
];

export interface Category {
  id: string;
  name: string;
  iconBg: string;
  image: string;
  filterKey: 'all' | 'Vegetables' | 'Dairy' | 'Snacks' | 'Beverages' | 'Grains' | 'Essentials' | 'Bakery' | 'PersonalCare' | 'Household';
}

export const CATEGORIES: Category[] = EXACT_CATEGORIES.map(i => ({
  id: i.id,
  name: i.name,
  iconBg: i.bgColor,
  image: i.cardImage,
  filterKey: (i.filterKey as any) || 'all'
}));

export const INITIAL_PRODUCTS: Product[] = [
  // Fruits & Vegetables Products matching media_1790472471159.png
  {
    id: 'prod-tomato',
    name: 'Tomato',
    unit: '1 kg',
    price: 80,
    originalPrice: 90,
    discountPercentage: 10,
    category: 'Vegetables',
    subCategory: 'salad',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 142,
    inStock: true,
    isFeatured: true,
    description: 'Fresh farm-picked plump red tomatoes. Naturally ripened, rich in antioxidants and vitamins.',
    packSizes: ['500 g', '1 kg', '2 kg', '5 kg']
  },
  {
    id: 'prod-potato',
    name: 'Potato',
    unit: '1 kg',
    price: 50,
    category: 'Vegetables',
    subCategory: 'root',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 98,
    inStock: true,
    isFeatured: true,
    description: 'Premium quality washed hill potatoes. Perfect for curries, boiling, and roasting.',
    packSizes: ['1 kg', '2.5 kg', '5 kg']
  },
  {
    id: 'prod-onion',
    name: 'Onion',
    unit: '1 kg',
    price: 60,
    category: 'Vegetables',
    subCategory: 'root',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviewsCount: 112,
    inStock: true,
    isFeatured: true,
    description: 'Crisp, pungent red onions harvested fresh. Ideal for daily cooking base.',
    packSizes: ['1 kg', '2 kg', '5 kg']
  },
  {
    id: 'prod-carrot',
    name: 'Carrot',
    unit: '500 g',
    price: 60,
    category: 'Vegetables',
    subCategory: 'root',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 84,
    inStock: true,
    isFeatured: true,
    description: 'Sweet, crunchy fresh farm carrots rich in beta carotene.',
    packSizes: ['500 g', '1 kg']
  },
  {
    id: 'prod-banana',
    name: 'Banana',
    unit: '1 kg',
    price: 120,
    category: 'Fruits',
    subCategory: 'fruits',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 126,
    inStock: true,
    isFeatured: true,
    description: 'Sweet, energy-rich ripe robusta bananas.',
    packSizes: ['1 kg', '1 Dozen']
  },
  {
    id: 'prod-apple-local',
    name: 'Apple (Local)',
    unit: '1 kg',
    price: 160,
    originalPrice: 190,
    discountPercentage: 15,
    category: 'Fruits',
    subCategory: 'fruits',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 95,
    inStock: true,
    isFeatured: true,
    description: 'Juicy, crisp sweet Mustang hill apples.',
    packSizes: ['1 kg', '2 kg']
  },
  {
    id: 'prod-lettuce',
    name: 'Lettuce',
    unit: '250 g',
    price: 70,
    category: 'Vegetables',
    subCategory: 'leafy',
    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 52,
    inStock: true,
    isFeatured: true,
    description: 'Fresh crisp green curly lettuce for salads and burgers.',
    packSizes: ['250 g', '500 g']
  },
  {
    id: 'prod-green-chilli',
    name: 'Green Chilli',
    unit: '250 g',
    price: 40,
    category: 'Vegetables',
    subCategory: 'herbs',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviewsCount: 78,
    inStock: true,
    isFeatured: true,
    description: 'Spicy, fresh green chillies for daily curries and pickles.',
    packSizes: ['250 g', '500 g']
  },
  {
    id: 'prod-avocado',
    name: 'Hass Avocado',
    unit: '1 pc',
    price: 180,
    category: 'Fruits',
    subCategory: 'exotic',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 42,
    inStock: true,
    isFeatured: false,
    description: 'Creamy nutrient-dense rich Hass avocado.',
    packSizes: ['1 pc', '2 pcs']
  },
  {
    id: 'prod-fresh-cuts',
    name: 'Fresh Cut Fruit Bowl',
    unit: '400 g',
    price: 140,
    category: 'Fruits',
    subCategory: 'fresh-cuts',
    image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 36,
    inStock: true,
    isFeatured: false,
    description: 'Hygienically cut and packed fresh seasonal fruits with fork.',
    packSizes: ['400 g']
  },

  // Other Grocery Items
  {
    id: 'prod-rice-daawat',
    name: 'Basmati Rice',
    unit: '1 kg',
    price: 180,
    originalPrice: 200,
    discountPercentage: 10,
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 76,
    inStock: true,
    isFeatured: true,
    description: 'Long grain aromatic traditional Basmati rice. Aged to perfection for exquisite fragrance and fluffy grains.',
    packSizes: ['1 kg', '5 kg', '20 kg']
  },
  {
    id: 'prod-sunflower-oil',
    name: 'Sunflower Oil',
    unit: '1 L',
    price: 250,
    originalPrice: 275,
    discountPercentage: 9,
    category: 'Essentials',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 88,
    inStock: true,
    isFeatured: true,
    description: 'Refined healthy sunflower cooking oil. Light, cholesterol-free and perfect for daily frying and curries.',
    packSizes: ['1 L', '2 L', '5 L']
  },
  {
    id: 'prod-milk-natura',
    name: 'Milk (Dairy Home)',
    unit: '1 L',
    price: 90,
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 204,
    inStock: true,
    isFeatured: true,
    description: 'Pasteurized standardized fresh cow milk from local dairy farms.',
    packSizes: ['500 ml', '1 L']
  },
  {
    id: 'prod-eggs',
    name: 'Farm Fresh Brown Eggs',
    unit: '1 Crate (30 pcs)',
    price: 480,
    originalPrice: 520,
    discountPercentage: 8,
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 160,
    inStock: true,
    isFeatured: true,
    description: 'Free-range poultry eggs rich in protein and omega-3. Clean and uncracked.',
    packSizes: ['6 pcs', '12 pcs', '1 Crate (30 pcs)']
  },
  {
    id: 'prod-waiwai',
    name: 'Wai Wai Quick Noodles (5-pack)',
    unit: '5 x 75g',
    price: 125,
    originalPrice: 135,
    discountPercentage: 7,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 310,
    inStock: true,
    isFeatured: true,
    description: 'Nepal’s favorite instant snack noodles with authentic spicy chicken seasoning and onion oil.',
    packSizes: ['Single 75g', '5-pack', 'Box of 30']
  },
  {
    id: 'prod-coke',
    name: 'Coca-Cola Original Taste',
    unit: '1.5 L',
    price: 150,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 89,
    inStock: true,
    isFeatured: true,
    description: 'Chilled refreshing sparkling beverage for meals and celebrations.',
    packSizes: ['500 ml', '1.5 L', '2.25 L']
  },
  {
    id: 'prod-bread',
    name: 'Whole Wheat Artisan Bread',
    unit: '400 g',
    price: 75,
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviewsCount: 45,
    inStock: true,
    isFeatured: true,
    description: 'Freshly baked soft whole wheat sliced sandwich bread.',
    packSizes: ['400 g', '800 g']
  }
];

export const DELIVERY_LOCATIONS = [
  { id: 'tikathali-main', name: 'Tikathali, Lalitpur', address: 'Ward 5, Mahalaxmi Municipality', isDefault: true, estTime: '30-45 mins' },
  { id: 'tikathali-chowk', name: 'Tikathali Chowk', address: 'Near Big Mart & Shiva Temple', isDefault: false, estTime: '25-40 mins' },
  { id: 'sanagaun', name: 'Sanagaun, Siddhipur', address: 'Mahalaxmi Ward 4', isDefault: false, estTime: '35-50 mins' },
  { id: 'imadol', name: 'Imadol, Krishna Mandir', address: 'Mahalaxmi Ward 1', isDefault: false, estTime: '30-45 mins' },
  { id: 'gwarko', name: 'Gwarko Ring Road', address: 'Near Flyover, Lalitpur', isDefault: false, estTime: '40-55 mins' },
  { id: 'lubhu', name: 'Lubhu Road', address: 'Mahalaxmi Ward 7', isDefault: false, estTime: '35-50 mins' }
];

export interface OrderItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'New'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready for Delivery'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Placed'
  | 'Packed';

export type PaymentMethod = 'COD' | 'eSewa' | 'Khalti' | 'Fonepay' | 'Bank Transfer';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';

export interface OrderTimelineItem {
  status: string;
  timestamp: string;
  note?: string;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  customerPhone: string;
  customerName: string;
  customerEmail?: string;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  riderName?: string;
  riderPhone?: string;
  deliveryPerson?: DeliveryPerson;
  cancellationReason?: string;
  orderTimeline?: OrderTimelineItem[];
  deliveryNotes?: string;
  assignedStore?: {
    storeId: string;
    storeName: string;
    storeAddress: string;
    distanceKm: number;
    isServiceable?: boolean;
    estimatedMinutes?: number;
  };
}

export const CATEGORY_PRODUCTS: Product[] = categoryProductsJson as Product[];
export const ALL_PRODUCTS: Product[] = [
  ...INITIAL_PRODUCTS,
  ...CATEGORY_PRODUCTS.filter(cp => !INITIAL_PRODUCTS.some(ip => ip.id === cp.id))
];

export function getSimilarProducts(product: Product, count = 6): Product[] {
  return ALL_PRODUCTS
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, count);
}

export function getRecommendedProducts(product: Product, count = 6): Product[] {
  return ALL_PRODUCTS
    .filter(p => p.id !== product.id && p.category !== product.category && (p.rating >= 4.7 || p.isFeatured))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
}
