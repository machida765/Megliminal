import { describe, expect, it } from 'vitest';
import {
  CATEGORY_CARD_CLASS,
  SEED_MAJOR_CATEGORY_IDS,
  postCardVisualClass,
  resolveCategoryIcon,
} from '@/lib/category-visual';

describe('postCardVisualClass', () => {
  it('大ジャンル ID に対応するクラスを返す', () => {
    expect(postCardVisualClass('youtube', 'post-1')).toBe('category-tinted');
    expect(postCardVisualClass('food', 'post-2')).toBe('category-tinted');
    expect(postCardVisualClass('anime', 'post-3')).toBe('category-tinted');
  });

  it('未登録ジャンルは従来のトーンにフォールバック', () => {
    expect(postCardVisualClass('unknown', 'post-abc')).toMatch(/^tone-/);
  });
});

describe('resolveCategoryIcon', () => {
  it('Lucide 名またはジャンル ID からアイコンを解決する', () => {
    expect(resolveCategoryIcon('BookOpen')).toBeTruthy();
    expect(resolveCategoryIcon('Youtube', 'youtube')).toBeTruthy();
    expect(resolveCategoryIcon('NotARealIcon', 'unknown')).toBeUndefined();
  });
});

describe('CATEGORY_CARD_CLASS', () => {
  it('シードデータの全大ジャンルをカバーする', () => {
    expect(SEED_MAJOR_CATEGORY_IDS).toHaveLength(25);
    for (const id of SEED_MAJOR_CATEGORY_IDS) {
      expect(CATEGORY_CARD_CLASS[id]).toBeTruthy();
    }
  });
});
