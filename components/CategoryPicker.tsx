'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MajorCategory, SubCategory } from '@/types';

const ALL = '__all__';
const NONE = '__none__';

type CategoryPickerProps = {
  majorCategories: MajorCategory[];
  subCategories: SubCategory[];
  majorCategoryId: string | null;
  subCategoryId: string | null;
  onMajorChange: (majorCategoryId: string | null) => void;
  onSubChange: (subCategoryId: string | null) => void;
  majorLabel?: string;
  subLabel?: string;
  /** 投稿フォーム用。中ジャンル未選択を許可する */
  subOptional?: boolean;
  /** 投稿フォーム用。大ジャンルを必須にする */
  majorRequired?: boolean;
};

export function CategoryPicker({
  majorCategories,
  subCategories,
  majorCategoryId,
  subCategoryId,
  onMajorChange,
  onSubChange,
  majorLabel = '大ジャンル',
  subLabel = '小ジャンル',
  subOptional = false,
  majorRequired = false,
}: CategoryPickerProps) {
  const activeMajorCategories = majorCategories.filter((c) => c.isActive);
  const availableSubs = subCategories.filter(
    (sub) =>
      sub.isActive &&
      majorCategoryId &&
      sub.majorCategoryId === majorCategoryId
  );
  const hasSubs = activeMajorCategories.some((major) =>
    subCategories.some((sub) => sub.isActive && sub.majorCategoryId === major.id)
  );

  const handleMajorChange = (value: string) => {
    const nextMajor = majorRequired
      ? value || null
      : !value || value === ALL
        ? null
        : value;
    onMajorChange(nextMajor);
    if (
      subCategoryId &&
      subCategories.find((sub) => sub.id === subCategoryId)?.majorCategoryId !==
        nextMajor
    ) {
      onSubChange(null);
    }
  };

  const handleSubChange = (value: string) => {
    if (!value || value === ALL || value === NONE) {
      onSubChange(null);
      return;
    }
    onSubChange(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold text-[#8a6a52] mb-2">{majorLabel}</p>
        <Select
          value={majorCategoryId ?? (majorRequired ? '' : ALL)}
          onValueChange={handleMajorChange}
        >
          <SelectTrigger className="w-full bg-white border-[#e4d2b8]">
            <SelectValue placeholder={majorRequired ? '大ジャンルを選択' : 'すべてのカテゴリ'} />
          </SelectTrigger>
          <SelectContent>
            {!majorRequired && (
              <SelectItem value={ALL}>すべてのカテゴリ</SelectItem>
            )}
            {activeMajorCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasSubs && (
        <div>
          <p className="text-xs font-bold text-[#8a6a52] mb-2">{subLabel}</p>
          <Select
            value={
              !majorCategoryId
                ? ALL
                : subCategoryId ?? (subOptional ? NONE : ALL)
            }
            onValueChange={handleSubChange}
            disabled={!majorCategoryId || availableSubs.length === 0}
          >
            <SelectTrigger className="w-full bg-white border-[#e4d2b8]">
              <SelectValue
                placeholder={
                  !majorCategoryId
                    ? '大ジャンルを先に選んでください'
                    : availableSubs.length === 0
                      ? '小ジャンルはありません'
                      : subOptional
                        ? '指定しない'
                        : 'すべて'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {subOptional ? (
                <SelectItem value={NONE}>指定しない</SelectItem>
              ) : (
                <SelectItem value={ALL}>すべて</SelectItem>
              )}
              {availableSubs.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
