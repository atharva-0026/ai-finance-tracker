import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Car,
  Home,
  Zap,
  Film,
  ShoppingBag,
  Activity,
  Plane,
  Smile,
  BookOpen,
  MoreHorizontal,
  LucideIcon,
} from 'lucide-react';
import { CATEGORY_METADATA } from '@/lib/ai/categorizer';

interface CategoryIconProps {
  category: string;
  size?: number;
  showBackground?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  'Food & Dining': Utensils,
  'Groceries': ShoppingCart,
  'Transportation': Car,
  'Housing & Rent': Home,
  'Utilities & Bills': Zap,
  'Entertainment': Film,
  'Shopping': ShoppingBag,
  'Health & Fitness': Activity,
  'Travel': Plane,
  'Personal Care': Smile,
  'Education & Learning': BookOpen,
  'Other / Miscellaneous': MoreHorizontal,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 18,
  showBackground = true,
}) => {
  const meta = CATEGORY_METADATA[category] || CATEGORY_METADATA['Other / Miscellaneous'];
  const IconComponent = iconMap[category] || MoreHorizontal;

  if (!showBackground) {
    return <IconComponent size={size} color={meta.color} />;
  }

  return (
    <div
      style={{
        width: `${size + 14}px`,
        height: `${size + 14}px`,
        borderRadius: '10px',
        backgroundColor: `${meta.color}1f`,
        border: `1px solid ${meta.color}3f`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: meta.color,
        flexShrink: 0,
      }}
    >
      <IconComponent size={size} />
    </div>
  );
};
