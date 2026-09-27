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

const FIXED_NOW = new Date(2026, 8, 27, 15, 0, 0);

describe('getPeriodStart', () => {
  it('all は null', () => {
    expect(getPeriodStart('all', FIXED_NOW)).toBeNull();
  });

  it('カレンダー上の区切りを返す', () => {
    expect(getPeriodStart('today', FIXED_NOW)).toEqual(new Date(2026, 8, 27));
    expect(getPeriodStart('week', FIXED_NOW)).toEqual(new Date(2026, 8, 21));
    expect(getPeriodStart('month', FIXED_NOW)).toEqual(new Date(2026, 8, 1));
    expect(getPeriodStart('quarter', FIXED_NOW)).toEqual(new Date(2026, 6, 1));
    expect(getPeriodStart('half', FIXED_NOW)).toEqual(new Date(2026, 6, 1));
  });
});

describe('isWithinPeriod', () => {
  it('all はいつでも true', () => {
    expect(isWithinPeriod(daysAgo(3650), 'all', FIXED_NOW)).toBe(true);
  });

  it('今週の開始以降を含む', () => {
    expect(isWithinPeriod(new Date(2026, 8, 21).toISOString(), 'week', FIXED_NOW)).toBe(true);
  });

  it('今週の開始より前は含まない', () => {
    expect(isWithinPeriod(new Date(2026, 8, 20, 23, 59).toISOString(), 'week', FIXED_NOW)).toBe(
      false
    );
  });
});

describe('countLikesForPost', () => {
  const likes = [
    like('a', 'p1', new Date().toISOString()),
    like('b', 'p1', daysAgo(20)),
    like('c', 'p2', new Date().toISOString()),
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
    post('p1', 'u1', new Date().toISOString()),
    post('p2', 'u1', daysAgo(40)),
    post('p3', 'u2', new Date().toISOString()),
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
    like('a', 'p1', new Date().toISOString()),
    like('b', 'p1', daysAgo(40)),
    like('c', 'p2', new Date().toISOString()),
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
