import { defaultSearchFilters, type SearchFilters } from '@/lib/search';

const VIEW_KEY = 'megliminal.search.view';
export const NAV_CURRENT_KEY = 'megliminal.nav.current';
export const NAV_FROM_KEY = 'megliminal.nav.from';

export type SearchViewSnapshot = {
  href: string;
  draft: SearchFilters;
  applied: SearchFilters;
  expanded: boolean;
  scrollY: number;
};

export function currentHref(): string {
  return `${window.location.pathname}${window.location.search}`;
}

export function saveSearchView(
  snapshot: Omit<SearchViewSnapshot, 'href'> & { href?: string }
): void {
  try {
    const payload: SearchViewSnapshot = {
      href: snapshot.href ?? currentHref(),
      draft: snapshot.draft,
      applied: snapshot.applied,
      expanded: snapshot.expanded,
      scrollY: snapshot.scrollY,
    };
    sessionStorage.setItem(VIEW_KEY, JSON.stringify(payload));
  } catch {
    // 保存できなくても検索自体は続ける
  }
}

export function readSearchView(href: string): SearchViewSnapshot | null {
  try {
    const raw = sessionStorage.getItem(VIEW_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SearchViewSnapshot>;
    if (parsed.href !== href || !parsed.draft || !parsed.applied) return null;
    return {
      href,
      draft: { ...defaultSearchFilters(), ...parsed.draft, tagIds: [], tagMatch: 'or' },
      applied: { ...defaultSearchFilters(), ...parsed.applied, tagIds: [], tagMatch: 'or' },
      expanded: Boolean(parsed.expanded),
      scrollY: typeof parsed.scrollY === 'number' ? parsed.scrollY : 0,
    };
  } catch {
    return null;
  }
}

export function readNavFrom(): string | null {
  try {
    return sessionStorage.getItem(NAV_FROM_KEY);
  } catch {
    return null;
  }
}
