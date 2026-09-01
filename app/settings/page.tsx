'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/components/providers/LocaleProvider';

/** 退会はプロフィール編集画面の下部に置いたので、ここは転送する */
export default function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslations();

  useEffect(() => {
    router.replace('/profile/edit#delete-account');
  }, [router]);

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center text-gray-500">
      {t('common.loading')}
    </div>
  );
}
