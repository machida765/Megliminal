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
  subOptional = false,
  majorRequired = false,
}: CategoryPickerProps) {
  const { t } = useTranslations();
  const majorLabelText = majorLabel ?? t('category.major');
  const subLabelText =
    subLabel ?? (subOptional ? t('category.subOptional') : t('category.sub'));

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
    if (!value) {
      onMajorChange(null);
      return;
    }
    const nextMajor = majorRequired ? value : value === ALL ? null : value;
    onMajorChange(nextMajor);
    if (
      subCategoryId &&
      subCategories.find((sub) => sub.id === subCategoryId)?.majorCategoryId !==
        nextMajor
    ) {
      onSubChange(null);
    }
  };

  const handleSubChange = (value: string | null) => {
    if (!value || value === ALL || value === NONE) {
      onSubChange(null);
      return;
    }
    onSubChange(value);
  };

  const majorSelectValue = majorCategoryId ?? undefined;
  const subSelectValue = subCategoryId ?? undefined;
  const selectedMajor = activeMajorCategories.find((c) => c.id === majorCategoryId);
  const selectedSub = availableSubs.find((s) => s.id === subCategoryId);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold text-[#8a6a52] mb-2">{majorLabelText}</p>
        <Select value={majorSelectValue} onValueChange={handleMajorChange}>
          <SelectTrigger className="w-full min-w-0 bg-white border-[#e4d2b8]">
            <SelectValue
              placeholder={
                majorRequired ? t('category.selectMajor') : t('category.allCategories')
              }
            >
              {selectedMajor?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {!majorRequired && (
              <SelectItem value={ALL} label={t('category.allCategories')}>
                {t('category.allCategories')}
              </SelectItem>
            )}
            {activeMajorCategories.map((category) => (
              <SelectItem key={category.id} value={category.id} label={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasSubs && (
        <div>
          <p className="text-xs font-bold text-[#8a6a52] mb-2">{subLabelText}</p>
          <Select
            value={subSelectValue}
            onValueChange={handleSubChange}
            disabled={!majorCategoryId || availableSubs.length === 0}
          >
            <SelectTrigger className="w-full min-w-0 bg-white border-[#e4d2b8]">
              <SelectValue
                placeholder={
                  !majorCategoryId
                    ? t('category.selectMajorFirst')
                    : availableSubs.length === 0
                      ? t('category.noSubCategories')
                      : subOptional
                        ? t('common.none')
                        : t('common.all')
                }
              >
                {selectedSub?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {subOptional ? (
                <SelectItem value={NONE} label={t('common.none')}>
                  {t('common.none')}
                </SelectItem>
              ) : (
                <SelectItem value={ALL} label={t('common.all')}>
                  {t('common.all')}
                </SelectItem>
              )}
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
