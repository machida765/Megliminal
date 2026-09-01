import { describe, expect, it } from 'vitest';
import {
  countLikesForPost,
  countLikesReceivedByUser,
  countPostsForUser,
  getPeriodStart,
  isWithinPeriod,
  syncPostLikeCounts,
} from '@/lib/ranking';
import type { Like, Post } from '@/types';

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function post(id: string, userId: string, createdAt: string): Post {
  return {
    id,
    userId,
    user: { id: userId, name: userId },
    majorCategoryId: 'cat-anime',
    subCategoryId: null,
    tagIds: [],
    title: id,
    description: id,
    createdAt,
    likeCount: 0,
  };
}

function like(id: string, postId: string, createdAt: string): Like {
  return { id, postId, userId: `u-${id}`, createdAt };
}

describe('getPeriodStart', () => {
  it('all は null', () => {
    expect(getPeriodStart('all')).toBeNull();
  });

  it('week は7日前あたり', () => {
    const start = getPeriodStart('week')!;
    const diffDays = (Date.now() - start.getTime()) / (24 * 60 * 60 * 1000);
    expect(diffDays).toBeGreaterThan(6.9);
    expect(diffDays).toBeLessThan(7.1);
  });

  it('month は1か月ぶん（28〜31日）さかのぼる', () => {
    const now = Date.now();
    const start = getPeriodStart('month')!;
    const diffDays = (now - start.getTime()) / (24 * 60 * 60 * 1000);
    expect(diffDays).toBeGreaterThanOrEqual(27.9);
    expect(diffDays).toBeLessThanOrEqual(31.1);
  });
});

describe('isWithinPeriod', () => {
  it('all はいつでも true', () => {
    expect(isWithinPeriod(daysAgo(3650), 'all')).toBe(true);
  });

  it('週間は3日前を含む', () => {
    expect(isWithinPeriod(daysAgo(3), 'week')).toBe(true);
  });

  it('週間は10日前を含まない', () => {
    expect(isWithinPeriod(daysAgo(10), 'week')).toBe(false);
  });
});

describe('countLikesForPost', () => {
  const likes = [
    like('a', 'p1', daysAgo(1)),
    like('b', 'p1', daysAgo(20)),
    like('c', 'p2', daysAgo(1)),
  ];

  it('全期間は投稿単位で数える', () => {
    expect(countLikesForPost(likes, 'p1', 'all')).toBe(2);
  });

  it('週間は期間内だけ数える', () => {
    expect(countLikesForPost(likes, 'p1', 'week')).toBe(1);
  });

  it('いいねのない投稿は0', () => {
    expect(countLikesForPost(likes, 'p3', 'all')).toBe(0);
  });
});

describe('countPostsForUser', () => {
  const posts = [
    post('p1', 'u1', daysAgo(1)),
    post('p2', 'u1', daysAgo(40)),
    post('p3', 'u2', daysAgo(1)),
  ];

  it('全期間', () => {
    expect(countPostsForUser(posts, 'u1', 'all')).toBe(2);
  });

  it('月間は期間内だけ', () => {
    expect(countPostsForUser(posts, 'u1', 'month')).toBe(1);
  });
});

describe('countLikesReceivedByUser', () => {
  const posts = [post('p1', 'u1', daysAgo(50)), post('p2', 'u2', daysAgo(50))];
  const likes = [
    like('a', 'p1', daysAgo(1)),
    like('b', 'p1', daysAgo(40)),
    like('c', 'p2', daysAgo(1)),
  ];

  it('自分の投稿が受けたいいねだけ数える', () => {
    expect(countLikesReceivedByUser(likes, posts, 'u1', 'all')).toBe(2);
  });

  it('期間で絞れる', () => {
    expect(countLikesReceivedByUser(likes, posts, 'u1', 'week')).toBe(1);
  });

  it('投稿のないユーザーは0', () => {
    expect(countLikesReceivedByUser(likes, posts, 'u3', 'all')).toBe(0);
  });
});

describe('syncPostLikeCounts', () => {
  it('likes の実数を post.likeCount に反映する', () => {
    const posts = [post('p1', 'u1', daysAgo(1)), post('p2', 'u1', daysAgo(1))];
    posts[0].likeCount = 999;

    syncPostLikeCounts(posts, [like('a', 'p1', daysAgo(1)), like('b', 'p1', daysAgo(1))]);

    expect(posts[0].likeCount).toBe(2);
    expect(posts[1].likeCount).toBe(0);
  });
});
