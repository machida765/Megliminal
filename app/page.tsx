/**
 * トップ `/`
 * サーバーでデータを取って HomePageClient に渡す（revalidate 秒ごとに再生成）
 */
import { HomePageClient } from '@/components/home/HomePageClient';
import { nextHomeFetchCount } from '@/lib/data/home-fetch-count';
import { getPublicRepository } from '@/lib/data/server';

/** 全ユーザー共通スナップショット（5分ごとに再生成） */
export const revalidate = 300;

export default async function Home() {
  const data = await getPublicRepository().getHomePageData();
  return <HomePageClient {...data} fetchCount={nextHomeFetchCount()} />;
}
