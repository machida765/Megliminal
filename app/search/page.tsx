'use client';

/**
 * 検索 `/search`
 * 投稿を一括取得し、条件は lib/search.ts でブラウザ側フィルタ。
 * 絞り込みは検索ボタン（または Enter）で確定。Suspense は useSearchParams（?q=）用。
 */
import { Suspense, useState, useMemo, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CategoryPicker } from '@/components/search/CategoryPicker';
import { PostCard } from '@/components/post/PostCard';
import { SearchPeriodFilter, formatSearchDateRangeLabel } from '@/components/search/SearchPeriodFilter';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { useMajorCategories, usePosts, useSubCategories, useTags } from '@/lib/data/hooks';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import {
  defaultSearchFilters,
  filterAndSortPosts,
  type SearchFilters,
  type SearchSort,
  type TagMatch,
} from '@/lib/search';
import { type Tag } from '@/types';
import { getMessages } from '@/messages';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { PageHeader } from '@/components/layout/PageHeader';
import { Minus, Plus, Search, X } from 'lucide-react';

function hasAdvancedFilters(filters: SearchFilters): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.period !== 'all' ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo) ||
    filters.tagIds.length > 0 ||
    filters.tagMatch === 'and'
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageFallback() {
  return (
    <div className="px-4 py-20 text-center text-quiet">
      {getMessages(DEFAULT_LOCALE).common.loading}
    </div>
  );
}

function SearchPageInner() {
  const { t, messages } = useTranslations();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { categories } = useMajorCategories();
  const { subCategories } = useSubCategories();
  const { tags } = useTags();
  const { posts, loading } = usePosts(user?.id);
  const [draft, setDraft] = useState<SearchFilters>(defaultSearchFilters);
  const [applied, setApplied] = useState<SearchFilters>(defaultSearchFilters);
  const [expanded, setExpanded] = useState(false);
  const [syncedQueryString, setSyncedQueryString] = useState<string | null>(null);

  // URL の検索条件が変わったら、フォームと適用中の条件に取り込む
  const queryString = searchParams.toString();
  if (queryString !== syncedQueryString) {
    setSyncedQueryString(queryString);

    const q = searchParams.get('q');
    const major = searchParams.get('major');
    const tag = searchParams.get('tag');

    if (q || major || tag) {
      const fromUrl = (prev: SearchFilters): SearchFilters => ({
        ...prev,
        query: q ?? prev.query,
        categoryId: major ?? prev.categoryId,
        tagIds: tag ? [tag] : prev.tagIds,
      });

      setDraft(fromUrl);
      setApplied(fromUrl);
      setExpanded(true);
    }
  }

  const filteredPosts = useMemo(
    () => filterAndSortPosts(posts, applied),
    [posts, applied]
  );

  const activeCategory = categories.find((c) => c.id === applied.categoryId);
  const activeSubCategory = subCategories.find((c) => c.id === applied.subCategoryId);
  const activeTags = tags.filter((tag) => applied.tagIds.includes(tag.id));
  const hasExtraFilters =
    Boolean(applied.categoryId) ||
    Boolean(applied.subCategoryId) ||
    applied.tagIds.length > 0 ||
    applied.period !== 'all' ||
    Boolean(applied.dateFrom) ||
    Boolean(applied.dateTo);

  const customDateLabel = useMemo(
    () => formatSearchDateRangeLabel(applied.dateFrom, applied.dateTo, t),
    [applied.dateFrom, applied.dateTo, t]
  );

  const patchDraft = (partial: Partial<SearchFilters>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const patchApplied = (partial: Partial<SearchFilters>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
    setApplied((prev) => ({ ...prev, ...partial }));
  };

  const toggleDraftTag = (tagId: string) => {
    setDraft((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const runSearch = (e?: FormEvent) => {
    e?.preventDefault();
    setApplied(draft);
  };

  const resetFilters = () => {
    const next = {
      ...defaultSearchFilters(),
      query: applied.query,
      sort: applied.sort,
    };
    setDraft(next);
    setApplied(next);
  };

  const toggleExpanded = () => setExpanded((open) => !open);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        kicker={t('search.kicker')}
        title={t('search.title')}
        description={t('search.description')}
        icon={<Search className="w-3.5 h-3.5" />}
      />

      <form onSubmit={runSearch} className="func-surface p-4 mb-4 space-y-4">
        <CategoryPicker
          majorCategories={categories}
          subCategories={subCategories}
          majorCategoryId={draft.categoryId}
          subCategoryId={draft.subCategoryId}
          onMajorChange={(categoryId) =>
            patchDraft({
              categoryId,
              subCategoryId:
                draft.subCategoryId &&
                subCategories.find((sub) => sub.id === draft.subCategoryId)
                  ?.majorCategoryId === categoryId
                  ? draft.subCategoryId
                  : null,
            })
          }
          onSubChange={(subCategoryId) => patchDraft({ subCategoryId })}
        />

        <button
          type="button"
          onClick={toggleExpanded}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand"
        >
          {expanded ? (
            <>
              <Minus className="w-4 h-4" />
              {t('search.advancedClose')}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {t('search.advancedOpen')}
              {hasAdvancedFilters(draft) && (
                <span className="text-xs font-normal text-quiet">
                  {t('search.advancedActive')}
                </span>
              )}
            </>
          )}
        </button>

        {expanded && (
          <div className="space-y-4 pt-3 border-t border-line">
            <div>
              <p className="text-xs font-bold text-quiet mb-2">{t('search.keyword')}</p>
              <Input
                type="text"
                placeholder={t('search.keywordPlaceholder')}
                value={draft.query}
                onChange={(e) => patchDraft({ query: e.target.value })}
                className="bg-white"
              />
            </div>

            <TagPicker
              tags={tags}
              selectedIds={draft.tagIds}
              onToggle={toggleDraftTag}
              match={draft.tagMatch}
              onMatchChange={(tagMatch) => patchDraft({ tagMatch })}
              labels={messages.search}
            />

            <div>
              <p className="text-xs font-bold text-quiet mb-2">{t('search.postedAt')}</p>
              <SearchPeriodFilter
                period={draft.period}
                dateFrom={draft.dateFrom}
                dateTo={draft.dateTo}
                onPeriodChange={(period) => patchDraft({ period })}
                onDateFromChange={(dateFrom) => patchDraft({ dateFrom })}
                onDateToChange={(dateTo) => patchDraft({ dateTo })}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="flat" className="gap-2 w-full sm:w-auto sm:min-w-32">
            <Search className="w-4 h-4" />
            {t('search.submit')}
          </Button>
        </div>
      </form>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <p className="text-sm text-quiet tabular">
          {loading
            ? '...'
            : t('search.resultCount', { count: filteredPosts.length })}
          {applied.tagIds.length > 1 && (
            <span className="ml-2 text-xs">
              {t('search.tagMatchNote', {
                mode:
                  applied.tagMatch === 'and'
                    ? messages.search.tagMatch.and
                    : messages.search.tagMatch.or,
              })}
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-quiet shrink-0">{t('common.sort')}</span>
          <Select
            value={applied.sort}
            onValueChange={(v) => patchApplied({ sort: (v ?? 'newest') as SearchSort })}
          >
            <SelectTrigger className="w-full sm:w-48 bg-white border-line">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(messages.search.sort) as SearchSort[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {messages.search.sort[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(hasExtraFilters || applied.query || applied.sort !== 'newest') && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {applied.query && (
            <FilterChip
              label={`「${applied.query}」`}
              onRemove={() => patchApplied({ query: '' })}
            />
          )}
          {activeSubCategory ? (
            <FilterChip
              label={activeSubCategory.name}
              onRemove={() => patchApplied({ subCategoryId: null })}
            />
          ) : (
            activeCategory && (
              <FilterChip
                label={activeCategory.name}
                onRemove={() => patchApplied({ categoryId: null, subCategoryId: null })}
              />
            )
          )}
          {activeTags.map((tag) => (
            <FilterChip
              key={tag.id}
              label={`#${tag.name}`}
              onRemove={() =>
                patchApplied({
                  tagIds: applied.tagIds.filter((id) => id !== tag.id),
                })
              }
            />
          ))}
          {customDateLabel ? (
            <FilterChip
              label={customDateLabel}
              onRemove={() => patchApplied({ dateFrom: null, dateTo: null })}
            />
          ) : (
            applied.period !== 'all' && (
              <FilterChip
                label={messages.ranking.period[applied.period]}
                onRemove={() => patchApplied({ period: 'all' })}
              />
            )
          )}
          {applied.sort !== 'newest' && (
            <span className="text-xs text-quiet">
              {messages.search.sort[applied.sort]}
            </span>
          )}
          {hasExtraFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-brand ml-1"
            >
              {t('common.clearFilters')}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {!loading && filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              categories={categories}
              subCategories={subCategories}
              flat
            />
          ))
        ) : (
          <div className="col-span-full func-surface p-10 text-center">
            <p className="text-quiet mb-3">
              {loading ? t('common.loading') : t('search.noResults')}
            </p>
            {!loading && hasExtraFilters && (
              <Button type="button" variant="flat-outline" onClick={resetFilters}>
                {t('search.clearRefinement')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TagPicker({
  tags,
  selectedIds,
  onToggle,
  match,
  onMatchChange,
  labels,
}: {
  tags: Tag[];
  selectedIds: string[];
  onToggle: (tagId: string) => void;
  match: TagMatch;
  onMatchChange: (match: TagMatch) => void;
  labels: {
    tags: string;
    tagMatch: { or: string; and: string };
  };
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="text-xs font-bold text-quiet">{labels.tags}</p>
        {onMatchChange && match && (
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant={match === 'or' ? 'flat' : 'flat-outline'}
              onClick={() => onMatchChange('or')}
            >
              {labels.tagMatch.or}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={match === 'and' ? 'flat' : 'flat-outline'}
              onClick={() => onMatchChange('and')}
            >
              {labels.tagMatch.and}
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags
          .filter((t) => t.isActive)
          .map((tag) => {
            const on = selectedIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggle(tag.id)}
                className={`text-sm px-3 py-1 border ${
                  on
                    ? 'bg-ink text-brand-ink border-ink'
                    : 'bg-surface text-ink border-line hover:bg-soft/50'
                }`}
              >
                #{tag.name}
              </button>
            );
          })}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 text-xs font-bold bg-soft text-ink px-2 py-1"
    >
      {label}
      <X className="w-3 h-3" />
    </button>
  );
}
