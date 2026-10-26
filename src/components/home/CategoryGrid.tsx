import React from 'react';
import { ExactCategoryGrid } from '../categories/ExactCategoryGrid';

interface CategoryGridProps {
  onSelectCategory: (category: any) => void;
  onViewAll?: () => void;
  isMobileLayout?: boolean;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  onViewAll,
  isMobileLayout = false
}) => {
  return (
    <ExactCategoryGrid
      onSelectCategory={onSelectCategory}
      onViewAll={onViewAll}
      isMobileLayout={isMobileLayout}
    />
  );
};
