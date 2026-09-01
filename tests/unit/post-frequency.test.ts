import { describe, expect, it } from 'vitest';
import { checkPostFrequency } from '@/lib/post-frequency';
import type { Post } from '@/types';

const NOW = new Date('2026-09-01T00:00:00.000Z');

function post(overrides: Partial<Post> & { createdAt: string }): Post {
  return {
    id: 'p1',
    userId: 'u1',
    user: { id: 'u1', name: 'u1' },
    majorCategoryId: 'cat-anime',
    subCategoryId: null,
    tagIds: [],
    title: 'title',
    description: 'description',
    likeCount: 0,
    ...overrides,
  };
}

function isoDaysBefore(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

describe('checkPostFrequency', () => {
  it('投稿履歴がなければ投稿できる', () => {
    expect(checkPostFrequency([], 'u1', 'cat-anime', NOW)).toEqual({ canPost: true });
  });

  it('同カテゴリに1週間以内の投稿があれば止める', () => {
    const result = checkPostFrequency(
      [post({ createdAt: isoDaysBefore(2) })],
      'u1',
      'cat-anime',
      NOW
    );

    expect(result.canPost).toBe(false);
    expect(result.daysRemaining).toBe(5);
    expect(result.nextAvailableAt).toBe(
      new Date(NOW.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
    );
  });

  it('ちょうど7日経っていれば投稿できる', () => {
    expect(
      checkPostFrequency([post({ createdAt: isoDaysBefore(7) })], 'u1', 'cat-anime', NOW)
        .canPost
    ).toBe(true);
  });

  it('別カテゴリの投稿は制限に影響しない', () => {
    expect(
      checkPostFrequency(
        [post({ majorCategoryId: 'cat-manga', createdAt: isoDaysBefore(1) })],
        'u1',
        'cat-anime',
        NOW
      ).canPost
    ).toBe(true);
  });

  it('他ユーザーの投稿は制限に影響しない', () => {
    expect(
      checkPostFrequency(
        [post({ userId: 'u2', createdAt: isoDaysBefore(1) })],
        'u1',
        'cat-anime',
        NOW
      ).canPost
    ).toBe(true);
  });

  it('残り日数は最低1日として返す', () => {
    const result = checkPostFrequency(
      [post({ createdAt: isoDaysBefore(6.99) })],
      'u1',
      'cat-anime',
      NOW
    );

    expect(result.canPost).toBe(false);
    expect(result.daysRemaining).toBe(1);
  });

  it('複数投稿があるときは直近を基準にする', () => {
    const result = checkPostFrequency(
      [
        post({ id: 'old', createdAt: isoDaysBefore(6) }),
        post({ id: 'new', createdAt: isoDaysBefore(1) }),
      ],
      'u1',
      'cat-anime',
      NOW
    );

    expect(result.daysRemaining).toBe(6);
  });
});
