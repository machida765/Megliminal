import { describe, expect, it } from 'vitest';
import {
  CATEGORY_ADMIN_ICON_OPTIONS,
  CATEGORY_CARD_CLASS,
  SEED_MAJOR_CATEGORY_IDS,
  postCardVisualClass,
  resolveCategoryIcon,
  solidCategoryPalette,
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

  it('保存した色があれば未登録 ID でもジャンル色を使う', () => {
    expect(
      postCardVisualClass('cat-new', 'post-abc', {
        from: '#112233',
        to: '#445566',
        accent: '#778899',
      })
    ).toBe('category-tinted');
  });
});

describe('resolveCategoryIcon', () => {
  it('Lucide 名またはジャンル ID からアイコンを解決する', () => {
    expect(resolveCategoryIcon('BookOpen')).toBeTruthy();
    expect(resolveCategoryIcon('Youtube', 'youtube')).toBeTruthy();
    expect(resolveCategoryIcon('NotARealIcon', 'unknown')).toBeUndefined();
  });
});

describe('CATEGORY_ADMIN_ICON_OPTIONS', () => {
  it('ジャンル既定より多くのアイコンを選べる', () => {
    expect(CATEGORY_ADMIN_ICON_OPTIONS.length).toBeGreaterThan(SEED_MAJOR_CATEGORY_IDS.length);
    for (const name of CATEGORY_ADMIN_ICON_OPTIONS) {
      expect(resolveCategoryIcon(name)).toBeTruthy();
    }
  });
});

describe('solidCategoryPalette', () => {
  it('1色を背景・ラベルの両方にそろえる', () => {
    expect(solidCategoryPalette('#AABBCC')).toEqual({
      from: '#aabbcc',
      to: '#aabbcc',
      accent: '#aabbcc',
    });
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
