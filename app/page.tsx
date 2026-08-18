import { HomePageClient } from '@/components/home/HomePageClient';
import { HomePageLocal } from '@/components/home/HomePageLocal';
import { isLocalDataSource } from '@/lib/config/data-source';
import { getPublicRepository } from '@/lib/data/server';

/** Supabase モード: 全ユーザー共通スナップショット（5分ごとに再生成） */
export const revalidate = 300;

export default async function Home() {
  if (isLocalDataSource()) {
    return <HomePageLocal />;
  }

  const data = await getPublicRepository().getHomePageData();
  return <HomePageClient {...data} />;
}
