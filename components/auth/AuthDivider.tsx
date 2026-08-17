'use client';

import { useTranslations } from '@/components/providers/LocaleProvider';
import { isSupabaseDataSource } from '@/lib/config/data-source';

export function AuthDivider() {
  const { t } = useTranslations();

  if (!isSupabaseDataSource()) {
    return null;
  }

  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white px-2 text-gray-500">{t('auth.oauth.or')}</span>
      </div>
    </div>
  );
}
