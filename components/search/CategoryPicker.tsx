'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/components/providers/LocaleProvider';
import type { MajorCategory, SubCategory } from '@/types';

type CategoryPickerProps = {
  majorCategories: MajorCategory[];
  subCategories: SubCategory[];
  majorCategoryId: string | null;
  subCategoryId: string | null;
  onMajorChange: (majorCategoryId: string | null) => void;
  onSubChange: (subCategoryId: string | null) => void;
  majorLabel?: string;
  subLabel?: string;
  /** 大ジャンル未指定の選択肢名。未指定時は i18n */
  allMajorLabel?: string;
  /** 小ジャンル未指定（すべて）の選択肢名。未指定時は i18n */
  allSubLabel?: string;
  /** 小ジャンル未指定（任意）の選択肢名。未指定時は i18n */
  noneSubLabel?: string;
  subOptional?: boolean;
  majorRequired?: boolean;
};

export function CategoryPicker({
  majorCategories,
  subCategories,
  majorCategoryId,
  subCategoryId,
  onMajorChange,
  onSubChange,
  majorLabel,
  subLabel,
  allMajorLabel,
  allSubLabel,
  noneSubLabel,
  subOptional = false,
  majorRequired = false,
}: CategoryPickerProps) {
  const { t } = useTranslations();
  const majorLabelText = majorLabel ?? t('category.major');
  const subLabelText =
    subLabel ?? (subOptional ? t('category.subOptional') : t('category.sub'));
  const allMajor = allMajorLabel ?? t('common.all');
  const allSub = allSubLabel ?? t('common.all');
  const noneSub = noneSubLabel ?? t('common.none');
  const emptySub = subOptional ? noneSub : allSub;

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

  const handleMajorChange = (value: string | null) => {
    const nextMajor =
      !value || (!majorRequired && value === allMajor) ? null : value;
    onMajorChange(nextMajor);
    const sub = subCategories.find((s) => s.id === subCategoryId);
    if (sub && sub.majorCategoryId !== nextMajor) onSubChange(null);
  };

  const handleSubChange = (value: string | null) => {
    onSubChange(!value || value === emptySub ? null : value);
  };

  const selectedMajorName = activeMajorCategories.find(
    (c) => c.id === majorCategoryId
  )?.name;
  const selectedSubName = availableSubs.find((s) => s.id === subCategoryId)?.name;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold text-quiet mb-2">{majorLabelText}</p>
        <Select
          value={majorRequired ? majorCategoryId || null : (majorCategoryId ?? allMajor)}
          onValueChange={handleMajorChange}
        >
          <SelectTrigger className="w-full min-w-0 bg-white border-line">
            <SelectValue
              placeholder={
                majorRequired ? t('category.selectMajor') : allMajor
              }
            >
              {selectedMajorName ?? (majorRequired ? undefined : allMajor)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {!majorRequired && (
              <SelectItem value={allMajor} label={allMajor}>
                {allMajor}
              </SelectItem>
            )}
            {activeMajorCategories.map((category) => (
              <SelectItem
                key={category.id}
                value={category.id}
                label={category.name}
              >
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasSubs && (
        <div>
          <p className="text-xs font-bold text-quiet mb-2">{subLabelText}</p>
          <Select
            value={subCategoryId ?? emptySub}
            onValueChange={handleSubChange}
            disabled={!majorCategoryId || availableSubs.length === 0}
          >
            <SelectTrigger className="w-full min-w-0 bg-white border-line">
              <SelectValue
                placeholder={
                  !majorCategoryId
                    ? t('category.selectMajorFirst')
                    : availableSubs.length === 0
                      ? t('category.noSubCategories')
                      : emptySub
                }
              >
                {selectedSubName ?? emptySub}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={emptySub} label={emptySub}>
                {emptySub}
              </SelectItem>
              {availableSubs.map((sub) => (
                <SelectItem key={sub.id} value={sub.id} label={sub.name}>
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
