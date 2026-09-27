'use client';

import { useTranslations } from '@/components/providers/LocaleProvider';
import {
  CATEGORY_ADMIN_ICON_OPTIONS,
  resolveCategoryIcon,
  solidCategoryPalette,
  type CategoryPalette,
} from '@/lib/category-visual';
import { cn } from '@/lib/utils';

type CategoryLookFieldsProps = {
  icon: string;
  palette: CategoryPalette;
  onIconChange: (icon: string) => void;
  onPaletteChange: (palette: CategoryPalette) => void;
};

export function CategoryLookFields({
  icon,
  palette,
  onIconChange,
  onPaletteChange,
}: CategoryLookFieldsProps) {
  const { t } = useTranslations();
  const PreviewIcon = resolveCategoryIcon(icon);
  const icons =
    icon && !CATEGORY_ADMIN_ICON_OPTIONS.includes(icon)
      ? [icon, ...CATEGORY_ADMIN_ICON_OPTIONS]
      : CATEGORY_ADMIN_ICON_OPTIONS;

  return (
    <div className="space-y-4">
      <div
        className="flex h-16 items-center justify-center gap-2 rounded-[14px] text-white"
        style={{ background: `color-mix(in srgb, ${palette.from} 72%, var(--surface))` }}
      >
        {PreviewIcon ? <PreviewIcon className="w-5 h-5" /> : null}
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: palette.from }}
        >
          {t('admin.categories.colorPreview')}
        </span>
      </div>

      <div>
        <p className="mb-1.5 text-xs text-quiet">{t('admin.categories.iconLabel')}</p>
        <div className="flex flex-wrap gap-2">
          {icons.map((iconName) => {
            const Icon = resolveCategoryIcon(iconName);
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => onIconChange(iconName)}
                className={cn(
                  'rounded-lg border p-2 transition-all',
                  icon === iconName
                    ? 'border-brand bg-brand text-brand-ink'
                    : 'border-line bg-page text-quiet hover:border-brand'
                )}
                title={iconName}
                aria-pressed={icon === iconName}
              >
                {Icon ? <Icon className="w-4 h-4" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-quiet">
        <span>{t('admin.categories.colorFrom')}</span>
        <input
          type="color"
          value={palette.from}
          onChange={(event) => onPaletteChange(solidCategoryPalette(event.target.value))}
          className="h-9 w-12 cursor-pointer rounded-md border border-line bg-transparent p-0.5"
          aria-label={t('admin.categories.colorFrom')}
        />
      </label>
    </div>
  );
}
