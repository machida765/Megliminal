import { useTranslations } from '@/components/providers/LocaleProvider';

export function RequiredBadge() {
  const { t } = useTranslations();
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-red-500/12 px-2 py-0.5 text-[11px] font-bold tracking-wide text-red-600">
      {t('common.required')}
    </span>
  );
}
