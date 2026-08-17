import { isWithinPeriod } from '@/lib/ranking';
import { getSearchSortLabels } from '@/lib/i18n/labels';
import type { Post, RankingPeriod } from '@/types';

export type SearchSort = 'newest' | 'oldest' | 'likes';
export type TagMatch = 'and' | 'or';

export type SearchFilters = {
  query: string;
  categoryId: string | null;
  subCategoryId: string | null;
  tagIds: string[];
  tagMatch: TagMatch;
  period: RankingPeriod;
  dateFrom: string | null;
  dateTo: string | null;
  sort: SearchSort;
};

/** @deprecated getSearchSortLabels() または useTranslations().messages.search.sort を使う */
export const SEARCH_SORT_LABELS = getSearchSortLabels();

export function defaultSearchFilters(): SearchFilters {
  return {
    query: '',
    categoryId: null,
    subCategoryId: null,
    tagIds: [],
    tagMatch: 'or',
    period: 'all',
    dateFrom: null,
    dateTo: null,
    sort: 'newest',
  };
}

export function filterAndSortPosts(posts: Post[], filters: SearchFilters): Post[] {
  const q = filters.query.trim().toLowerCase();

  const filtered = posts.filter((post) => {
    const matchesQuery =
      q.length === 0 ||
      post.title.toLowerCase().includes(q) ||
      (post.description ?? '').toLowerCase().includes(q) ||
      (post.url ?? '').toLowerCase().includes(q) ||
      post.user.name.toLowerCase().includes(q);

    const matchesCategory = (() => {
      if (filters.subCategoryId) {
        return post.subCategoryId === filters.subCategoryId;
      }
      if (filters.categoryId) {
        return post.majorCategoryId === filters.categoryId;
      }
      return true;
    })();

    const matchesTags = (() => {
      if (filters.tagIds.length === 0) return true;
      if (filters.tagMatch === 'and') {
        return filters.tagIds.every((id) => post.tagIds.includes(id));
      }
      return filters.tagIds.some((id) => post.tagIds.includes(id));
    })();

    const matchesPeriod = (() => {
      if (filters.dateFrom || filters.dateTo) {
        return isWithinDateRange(post.createdAt, filters.dateFrom, filters.dateTo);
      }
      return isWithinPeriod(post.createdAt, filters.period);
    })();

    return matchesQuery && matchesCategory && matchesTags && matchesPeriod;
  });

  return [...filtered].sort((a, b) => {
    if (filters.sort === 'likes') return b.likeCount - a.likeCount;
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return filters.sort === 'oldest' ? aTime - bTime : bTime - aTime;
  });
}

export function isWithinDateRange(
  dateIso: string,
  dateFrom: string | null,
  dateTo: string | null
): boolean {
  if (!dateFrom && !dateTo) return true;

  const time = new Date(dateIso).getTime();

  if (dateFrom) {
    const start = new Date(dateFrom);
    start.setHours(0, 0, 0, 0);
    if (time < start.getTime()) return false;
  }

  if (dateTo) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    if (time > end.getTime()) return false;
  }

  return true;
}
