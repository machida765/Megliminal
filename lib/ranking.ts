import type { Like, Post, RankingPeriod } from '@/types';

export const RANKING_PERIODS: RankingPeriod[] = [
  'today',
  'week',
  'month',
  'quarter',
  'half',
  'all',
];

function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

/** 今日・今週（月曜始まり）・今月・今四半期・今半期の開始。全期間は null。 */
export function getPeriodStart(period: RankingPeriod, now: Date = new Date()): Date | null {
  if (period === 'all') return null;

  const start = startOfDay(now);
  if (period === 'today') return start;

  if (period === 'week') {
    const day = start.getDay();
    const daysFromMonday = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - daysFromMonday);
    return start;
  }

  if (period === 'month') {
    start.setDate(1);
    return start;
  }

  if (period === 'quarter') {
    const month = start.getMonth();
    start.setMonth(month - (month % 3), 1);
    return start;
  }

  start.setMonth(start.getMonth() < 6 ? 0 : 6, 1);
  return start;
}

export function isWithinPeriod(
  dateIso: string,
  period: RankingPeriod,
  now: Date = new Date()
): boolean {
  const start = getPeriodStart(period, now);
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
