import type { Like, Post, RankingPeriod } from '@/types';

export function getPeriodStart(period: RankingPeriod): Date | null {
  const now = new Date();
  if (period === 'all') return null;
  if (period === 'week') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return start;
  }
  const start = new Date(now);
  start.setMonth(start.getMonth() - 1);
  return start;
}

export function isWithinPeriod(dateIso: string, period: RankingPeriod): boolean {
  const start = getPeriodStart(period);
  if (!start) return true;
  return new Date(dateIso) >= start;
}

export function countLikesForPost(
  likes: Like[],
  postId: string,
  period: RankingPeriod
): number {
  return likes.filter(
    (l) => l.postId === postId && isWithinPeriod(l.createdAt, period)
  ).length;
}

export function countPostsForUser(
  posts: Post[],
  userId: string,
  period: RankingPeriod
): number {
  return posts.filter(
    (p) => p.userId === userId && isWithinPeriod(p.createdAt, period)
  ).length;
}

export function countLikesReceivedByUser(
  likes: Like[],
  posts: Post[],
  userId: string,
  period: RankingPeriod
): number {
  const userPostIds = new Set(
    posts.filter((p) => p.userId === userId).map((p) => p.id)
  );
  return likes.filter(
    (l) =>
      userPostIds.has(l.postId) && isWithinPeriod(l.createdAt, period)
  ).length;
}

/** post.likeCount と個別 likes の整合用（Local モード） */
export function syncPostLikeCounts(posts: Post[], likes: Like[]) {
  for (const post of posts) {
    post.likeCount = likes.filter((l) => l.postId === post.id).length;
  }
}
