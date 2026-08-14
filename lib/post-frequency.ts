import { Post } from '@/types';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * 大ジャンルにつき、ユーザーは1週間に1回まで投稿可能か判定する。
 * Phase 3 では Supabase RPC に置き換える。
 */
export function checkPostFrequency(
  posts: Post[],
  userId: string,
  majorCategoryId: string,
  now: Date = new Date()
): { canPost: boolean; nextAvailableAt?: string; daysRemaining?: number } {
  const recent = posts
    .filter(
      (p) =>
        p.userId === userId &&
        p.majorCategoryId === majorCategoryId &&
        now.getTime() - new Date(p.createdAt).getTime() < ONE_WEEK_MS
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  if (!recent) {
    return { canPost: true };
  }

  const nextAvailable = new Date(new Date(recent.createdAt).getTime() + ONE_WEEK_MS);
  const msRemaining = nextAvailable.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));

  return {
    canPost: false,
    nextAvailableAt: nextAvailable.toISOString(),
    daysRemaining: Math.max(daysRemaining, 1),
  };
}
