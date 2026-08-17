'use client';

import { useCallback, useEffect, useState } from 'react';
import { getRepository } from '@/lib/data';
import type { HomePageData } from '@/lib/data/types';
import { HomePageClient } from '@/components/home/HomePageClient';
import { useTranslations } from '@/components/providers/LocaleProvider';

/** Local モード専用: ブラウザ内ストアからトップを描画（投稿テスト向け） */
export function HomePageLocal() {
  const { t } = useTranslations();
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getRepository().getHomePageData();
      setData(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-[#8a6a52]">
        {t('home.loading')}
      </div>
    );
  }

  return <HomePageClient {...data} />;
}
