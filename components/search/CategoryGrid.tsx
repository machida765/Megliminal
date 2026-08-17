// components/search/CategoryGrid.tsx

'use client';

import { MajorCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/components/providers/LocaleProvider';
import * as LucideIcons from 'lucide-react';

interface CategoryGridProps {
  categories: MajorCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryGrid({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryGridProps) {
  const { t } = useTranslations();

  // アイコン名からアイコンコンポーネントを取得
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-8">
      <Button
        variant={selectedCategory === null ? 'default' : 'outline'}
        onClick={() => onSelectCategory(null as any)}
        className="flex flex-col items-center justify-center h-20"
      >
        <span className="text-xl mb-1">✨</span>
        <span className="text-xs">{t('common.all')}</span>
      </Button>

      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          onClick={() => onSelectCategory(category.id)}
          className="flex flex-col items-center justify-center h-20"
        >
          {getIcon(category.icon)}
          <span className="text-xs text-center mt-1">{category.name}</span>
        </Button>
      ))}
    </div>
  );
}
