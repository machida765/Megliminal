import type { CSSProperties, ComponentType } from 'react';
import * as LucideIcons from 'lucide-react';
import { cardTone } from '@/lib/card-tone';
import type { CategoryPalette } from '@/types';

export type { CategoryPalette };

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export const DEFAULT_CATEGORY_PALETTE: CategoryPalette = {
  from: '#c4b8aa',
  to: '#7a746c',
  accent: '#7a746c',
};

type CategoryCatalogEntry = {
  id: string;
  icon: string;
  palette: CategoryPalette;
};

/** 大ジャンルの見た目。DB の id と揃える */
export const MAJOR_CATEGORY_CATALOG: readonly CategoryCatalogEntry[] = [
  { id: 'youtube', icon: 'Video', palette: { from: '#ff6b6b', to: '#c0392b', accent: '#b83232' } },
  { id: 'books', icon: 'BookOpen', palette: { from: '#d4a574', to: '#8b6914', accent: '#8b5a2b' } },
  { id: 'manga', icon: 'BookMarked', palette: { from: '#e8a090', to: '#b45c4a', accent: '#b45c4a' } },
  { id: 'movies', icon: 'Film', palette: { from: '#9b8fd9', to: '#5c4d8a', accent: '#5c4d8a' } },
  { id: 'anime', icon: 'Sparkles', palette: { from: '#f0a0c8', to: '#c45a96', accent: '#c45a96' } },
  { id: 'drama', icon: 'Tv', palette: { from: '#b8a0d4', to: '#6e4e9a', accent: '#6e4e9a' } },
  { id: 'music', icon: 'Music', palette: { from: '#6ecfc9', to: '#2a7a7a', accent: '#2a7a7a' } },
  { id: 'games', icon: 'Gamepad2', palette: { from: '#7bc67e', to: '#3d7a4a', accent: '#3d7a4a' } },
  { id: 'radio', icon: 'Radio', palette: { from: '#c8b070', to: '#7a6828', accent: '#7a6828' } },
  { id: 'apps', icon: 'Cpu', palette: { from: '#7eb0e8', to: '#3a6ea5', accent: '#3a6ea5' } },
  { id: 'food', icon: 'UtensilsCrossed', palette: { from: '#f0b07a', to: '#c4763a', accent: '#c4763a' } },
  { id: 'gadgets', icon: 'Lightbulb', palette: { from: '#a8b4c4', to: '#5a6578', accent: '#5a6578' } },
  { id: 'spots', icon: 'MapPin', palette: { from: '#6ecfaa', to: '#2d8a6e', accent: '#2d8a6e' } },
  { id: 'photo', icon: 'Camera', palette: { from: '#8aa8c8', to: '#3d5a78', accent: '#3d5a78' } },
  { id: 'fashion', icon: 'Shirt', palette: { from: '#d4a0b8', to: '#9a5a78', accent: '#9a5a78' } },
  { id: 'streaming', icon: 'Cast', palette: { from: '#c080d0', to: '#7a4090', accent: '#7a4090' } },
  { id: 'theater', icon: 'Drama', palette: { from: '#d090a0', to: '#8a4058', accent: '#8a4058' } },
  { id: 'doujin', icon: 'PenTool', palette: { from: '#d4a070', to: '#8a5830', accent: '#8a5830' } },
  { id: 'occult', icon: 'Ghost', palette: { from: '#8a7aa8', to: '#4a3d68', accent: '#4a3d68' } },
  { id: 'creatures', icon: 'PawPrint', palette: { from: '#a8c478', to: '#5a7a38', accent: '#5a7a38' } },
  { id: 'culture', icon: 'Landmark', palette: { from: '#d4b878', to: '#8a6a28', accent: '#8a6a28' } },
  { id: 'academia', icon: 'GraduationCap', palette: { from: '#8ab0d4', to: '#3d6288', accent: '#3d6288' } },
  { id: 'region', icon: 'MapPinned', palette: { from: '#7cbc78', to: '#3a7a40', accent: '#3a7a40' } },
  { id: 'art', icon: 'Palette', palette: { from: '#e0a070', to: '#a05a30', accent: '#a05a30' } },
  { id: 'other', icon: 'MoreHorizontal', palette: { from: '#c4b8aa', to: '#7a746c', accent: '#7a746c' } },
];

export const SEED_MAJOR_CATEGORY_IDS = MAJOR_CATEGORY_CATALOG.map(
  (entry) => entry.id
);

export const CATEGORY_PALETTE: Record<string, CategoryPalette> =
  Object.fromEntries(
    MAJOR_CATEGORY_CATALOG.map((entry) => [entry.id, entry.palette])
  );

/** 大ジャンル ID → カード用 CSS クラス */
export const CATEGORY_CARD_CLASS: Record<string, string> =
  Object.fromEntries(
    MAJOR_CATEGORY_CATALOG.map((entry) => [entry.id, 'category-tinted'])
  );

/** DB の icon 名が Lucide に無い場合の代替 */
export const CATEGORY_ICON_FALLBACK: Record<string, string> =
  Object.fromEntries(
    MAJOR_CATEGORY_CATALOG.map((entry) => [entry.id, entry.icon])
  );

const ICON_CANDIDATES = [
  ...MAJOR_CATEGORY_CATALOG.map((entry) => entry.icon),
  'Star',
  'Heart',
  'Leaf',
  'Briefcase',
  'Coffee',
  'Pizza',
  'Wine',
  'Cake',
  'IceCreamCone',
  'Utensils',
  'Soup',
  'Plane',
  'Train',
  'Car',
  'Bike',
  'Ship',
  'House',
  'Building2',
  'Store',
  'Hotel',
  'Cat',
  'Dog',
  'Fish',
  'Bird',
  'Flower2',
  'TreePine',
  'Mic',
  'Headphones',
  'Podcast',
  'Clapperboard',
  'Book',
  'Library',
  'Newspaper',
  'Pen',
  'Pencil',
  'Brush',
  'Dumbbell',
  'Trophy',
  'Medal',
  'Flag',
  'Globe',
  'Compass',
  'Mountain',
  'Sun',
  'Moon',
  'Cloud',
  'Smartphone',
  'Laptop',
  'Monitor',
  'Wifi',
  'Bot',
  'Gift',
  'ShoppingBag',
  'Ticket',
  'Gem',
  'Users',
  'Smile',
  'MessageCircle',
  'Flame',
  'Zap',
  'Rocket',
  'Popcorn',
  'Beer',
  'Backpack',
  'Tent',
  'Guitar',
  'Drum',
  'Puzzle',
  'Dice5',
  'Atom',
  'FlaskConical',
  'Stethoscope',
  'Hammer',
  'Paintbrush',
  'Image',
  'Music2',
  'Swords',
  'Skull',
  'Church',
  'Castle',
  'Glasses',
  'Scissors',
  'Baby',
  'Footprints',
  'Volleyball',
  'ChefHat',
  'Croissant',
  'Salad',
];

function isPalette(value: CategoryPalette | null | undefined): value is CategoryPalette {
  return Boolean(
    value &&
      HEX_COLOR.test(value.from) &&
      HEX_COLOR.test(value.to) &&
      HEX_COLOR.test(value.accent)
  );
}

/** DB の色があればそれを使い、無ければジャンル ID の既定色に戻す */
export function resolveCategoryPalette(
  majorCategoryId?: string,
  palette?: CategoryPalette | null
): CategoryPalette | undefined {
  if (isPalette(palette)) {
    return {
      from: palette.from.toLowerCase(),
      to: palette.to.toLowerCase(),
      accent: palette.accent.toLowerCase(),
    };
  }
  if (majorCategoryId && CATEGORY_PALETTE[majorCategoryId]) {
    return CATEGORY_PALETTE[majorCategoryId];
  }
  return undefined;
}

export function categoryVisualStyle(
  majorCategoryId?: string,
  palette?: CategoryPalette | null
): CSSProperties | undefined {
  const resolved = resolveCategoryPalette(majorCategoryId, palette);
  if (!resolved) return undefined;
  return {
    '--cat-from': resolved.from,
    '--cat-to': resolved.to,
    '--cat-accent': resolved.accent,
  } as CSSProperties;
}

/** 投稿カードに付与する見た目クラス（ジャンルの色があれば tint、無ければ従来のトーン） */
export function postCardVisualClass(
  majorCategoryId: string | undefined,
  fallbackSeed: string,
  palette?: CategoryPalette | null
): string {
  if (resolveCategoryPalette(majorCategoryId, palette)) {
    return 'category-tinted';
  }
  return cardTone(fallbackSeed);
}

function lookupLucideIcon(
  name?: string
): ComponentType<{ className?: string }> | undefined {
  if (!name) return undefined;
  return (
    LucideIcons as unknown as Record<
      string,
      ComponentType<{ className?: string }>
    >
  )[name];
}

/** major_categories.icon（Lucide 名）またはジャンル ID からアイコンを解決 */
export function resolveCategoryIcon(
  iconName?: string,
  categoryId?: string
): ComponentType<{ className?: string }> | undefined {
  return (
    lookupLucideIcon(iconName) ??
    lookupLucideIcon(categoryId ? CATEGORY_ICON_FALLBACK[categoryId] : undefined)
  );
}

/** 管理画面で選べるアイコン。Lucide に無い名前は出さない */
export const CATEGORY_ADMIN_ICON_OPTIONS = [
  ...new Set(ICON_CANDIDATES.filter((name) => lookupLucideIcon(name))),
];

/** 管理画面の1色指定を、保存用の3フィールドにそろえる */
export function solidCategoryPalette(color: string): CategoryPalette {
  const hex = color.toLowerCase();
  return { from: hex, to: hex, accent: hex };
}
