import React, { useEffect, useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { EXACT_CATEGORIES, ExactCategory, Product } from '../../data/mockData';
import { categoryService, AdminCategory } from '../../services/categoryService';
import { CategoryProductRow, CategoryInfo } from './CategoryProductRow';

interface HomeCategoryShowcasesProps {
  onSelectCategory: (category: any) => void;
  onOpenProductDetails?: (product: Product) => void;
  isMobileLayout?: boolean;
}

export const HomeCategoryShowcases: React.FC<HomeCategoryShowcasesProps> = ({
  onSelectCategory,
  onOpenProductDetails,
  isMobileLayout = false
}) => {
  const { products } = useOrders();
  const [categories, setCategories] = useState<CategoryInfo[]>(EXACT_CATEGORIES);

  useEffect(() => {
    // Try to load any newly added / modified categories from backend or local storage
    categoryService.getCategories({ status: 'active' }).then(adminCats => {
      if (adminCats && adminCats.length > 0) {
        // Map AdminCategory to CategoryInfo
        const mapped: CategoryInfo[] = adminCats.map(ac => ({
          id: ac.id || ac.slug,
          name: ac.name,
          count: ac.itemCount || '60+ Items',
          cardImage: ac.cardImage,
          prodImage: ac.prodImage || ac.cardImage,
          bgColor: ac.bgColor,
          arrowBg: ac.badgeColor,
          filterKey: ac.filterKey
        }));
        setCategories(mapped);
      }
    }).catch(() => {
      // Fallback stays EXACT_CATEGORIES
    });
  }, []);

  const filterProducts = (cat: CategoryInfo, allProds: Product[]): Product[] => {
    const catId = (cat.id || '').toLowerCase();
    const catName = (cat.name || '').toLowerCase();
    const filterKey = (cat.filterKey || '').toLowerCase();

    return allProds.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      const pSub = (p.subCategory || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();

      // 1. Vegetables & Fruits
      if (catId.includes('veg') || catName.includes('vegetable') || catName.includes('fruit')) {
        return (
          pCat === 'vegetables' ||
          pCat === 'fruits' ||
          pCat.includes('veg') ||
          pCat.includes('fruit') ||
          pSub.includes('leafy') ||
          pSub.includes('root') ||
          pSub.includes('salad')
        );
      }

      // 2. Dairy & Eggs
      if (catId.includes('dairy') || catId.includes('egg') || catName.includes('dairy') || catName.includes('egg')) {
        return (
          pCat === 'dairy' ||
          pCat.includes('dairy') ||
          pCat.includes('egg') ||
          pName.includes('milk') ||
          pName.includes('paneer') ||
          pName.includes('curd') ||
          pName.includes('cheese') ||
          pName.includes('butter') ||
          pName.includes('egg')
        );
      }

      // 3. Rice, Dal & Grains
      if (catId.includes('rice') || catId.includes('grain') || catName.includes('rice') || catName.includes('grain') || catName.includes('dal')) {
        return (
          pCat === 'grains' ||
          pCat.includes('grain') ||
          pCat.includes('rice') ||
          pCat.includes('dal') ||
          pName.includes('rice') ||
          pName.includes('dal') ||
          pName.includes('atta') ||
          pName.includes('flour')
        );
      }

      // 4. Cooking Essentials
      if (catId.includes('cook') || catId.includes('essential') || catName.includes('cooking') || catName.includes('essential')) {
        return (
          pCat === 'essentials' ||
          pCat.includes('essential') ||
          pCat.includes('oil') ||
          pCat.includes('masala') ||
          pCat.includes('spice') ||
          pName.includes('oil') ||
          pName.includes('ghee') ||
          pName.includes('salt') ||
          pName.includes('sugar')
        );
      }

      // 5. Snacks & Beverages
      if (catId.includes('snack') || catId.includes('beverage') || catName.includes('snack') || catName.includes('beverage')) {
        return (
          pCat === 'snacks' ||
          pCat === 'beverages' ||
          pCat.includes('snack') ||
          pCat.includes('drink') ||
          pCat.includes('instant') ||
          pName.includes('chips') ||
          pName.includes('coke') ||
          pName.includes('juice') ||
          pName.includes('biscuit') ||
          pName.includes('noodle') ||
          pName.includes('wafer')
        );
      }

      // 6. Bakery & Breakfast
      if (catId.includes('bakery') || catId.includes('breakfast') || catName.includes('bakery') || catName.includes('breakfast')) {
        return (
          pCat === 'bakery' ||
          pCat.includes('bakery') ||
          pCat.includes('breakfast') ||
          pName.includes('bread') ||
          pName.includes('bun') ||
          pName.includes('toast') ||
          pName.includes('jam') ||
          pName.includes('croissant')
        );
      }

      // 7. Household Items
      if (catId.includes('house') || catName.includes('household') || catName.includes('clean')) {
        return (
          pCat === 'household' ||
          pCat.includes('house') ||
          pCat.includes('clean') ||
          pName.includes('detergent') ||
          pName.includes('surf') ||
          pName.includes('vim') ||
          pName.includes('harpic') ||
          pName.includes('tissue') ||
          pName.includes('mop')
        );
      }

      // 8. Personal Care
      if (catId.includes('personal') || catName.includes('personal') || catName.includes('beauty')) {
        return (
          pCat === 'personalcare' ||
          pCat.includes('personal') ||
          pCat.includes('beauty') ||
          pCat.includes('skin') ||
          pName.includes('shampoo') ||
          pName.includes('soap') ||
          pName.includes('colgate') ||
          pName.includes('paste') ||
          pName.includes('brush')
        );
      }

      // 9. Baby Care
      if (catId.includes('baby') || catName.includes('baby')) {
        return (
          pCat === 'babycare' ||
          pCat.includes('baby') ||
          pName.includes('diaper') ||
          pName.includes('baby') ||
          pName.includes('cerelac') ||
          pName.includes('wipes')
        );
      }

      // Direct match or filterKey match
      return filterKey && (pCat === filterKey || pCat.includes(filterKey));
    });
  };

  return (
    <div className="space-y-2">
      {categories.map(cat => {
        const catProducts = filterProducts(cat, products);
        if (catProducts.length === 0) return null;

        return (
          <CategoryProductRow
            key={cat.id}
            category={cat}
            products={catProducts}
            onSeeAll={() => onSelectCategory(cat)}
            onOpenProductDetails={onOpenProductDetails}
            isMobileLayout={isMobileLayout}
          />
        );
      })}
    </div>
  );
};
