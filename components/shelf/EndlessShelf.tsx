'use client';

/** 投稿を背表紙として並べる本棚。ジャンルごとに一段。 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Post, MajorCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { BookmarkButton } from '@/components/post/BookmarkButton';
import { UserAvatar } from '@/components/user/UserAvatar';
import { SHOW_USER_IDENTITY } from '@/lib/auth/public-board';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { useMajorCategories, usePosts } from '@/lib/data/hooks';
import { cardTone } from '@/lib/card-tone';
import { cn } from '@/lib/utils';

type ShelfRow = {
  categoryId: string;
  label: string;
  posts: Post[];
};

function spineMetrics(id: string, likeCount: number) {
  const n = [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return {
    height: 168 + (n % 92) + Math.min(likeCount * 2, 28),
    width: 38 + (n % 16),
  };
}

function buildRows(
  posts: Post[],
  categories: MajorCategory[],
  uncategorizedLabel: string
): ShelfRow[] {
  const active = categories
    .filter((c) => c.isActive)
    .sort((a, b) => a.order - b.order);
  const byId = new Map(active.map((c) => [c.id, c]));
  const buckets = new Map<string, Post[]>();

  for (const post of posts) {
    const key = byId.has(post.majorCategoryId)
      ? post.majorCategoryId
      : '__other__';
    const list = buckets.get(key) ?? [];
    list.push(post);
    buckets.set(key, list);
  }

  const rows: ShelfRow[] = [];
  for (const category of active) {
    const list = buckets.get(category.id);
    if (!list?.length) continue;
    rows.push({ categoryId: category.id, label: category.name, posts: list });
  }
  const other = buckets.get('__other__');
  if (other?.length) {
    rows.push({
      categoryId: '__other__',
      label: uncategorizedLabel,
      posts: other,
    });
  }
  return rows;
}

export function EndlessShelf() {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { categories } = useMajorCategories();
  const { posts, loading } = usePosts(user?.id);
  const [genreId, setGenreId] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(
    () => buildRows(posts, categories, t('shelf.uncategorized')),
    [posts, categories, t]
  );
  const visibleRows = genreId === 'all' ? rows : rows.filter((r) => r.categoryId === genreId);
  const selected =
    posts.find((p) => p.id === selectedId) ?? visibleRows[0]?.posts[0] ?? null;

  const selectedCategory = categories.find((c) => c.id === selected?.majorCategoryId);
  const quote = selected
    ? (selected.description ?? '').length > 160
      ? `${(selected.description ?? '').slice(0, 160)}…`
      : (selected.description ?? '')
    : '';

  return (
    <div className="endless-shelf">
      <div className="endless-shelf-main">
        <header className="endless-shelf-head">
          <p className="section-kicker">{t('shelf.kicker')}</p>
          <h1 className="font-display">{t('shelf.title')}</h1>
          <p>{t('shelf.lead')}</p>
        </header>

        <nav className="shelf-index" aria-label={t('shelf.title')}>
          <button
            type="button"
            className={cn(genreId === 'all' && 'is-active')}
            onClick={() => setGenreId('all')}
          >
            {t('common.all')}
          </button>
          {rows.map((row) => (
            <button
              key={row.categoryId}
              type="button"
              className={cn(genreId === row.categoryId && 'is-active')}
              onClick={() => {
                setGenreId(row.categoryId);
                setSelectedId(row.posts[0]?.id ?? null);
              }}
            >
              {row.label}
              <span>{t('shelf.count', { count: row.posts.length })}</span>
            </button>
          ))}
        </nav>

        {loading ? (
          <p className="text-center text-quiet py-16">{t('common.loading')}</p>
        ) : visibleRows.length === 0 ? (
          <p className="text-center text-quiet py-16">
            {posts.length === 0 ? t('shelf.empty') : t('shelf.emptyGenre')}
          </p>
        ) : (
          <div className="shelf-aisle">
            {visibleRows.map((row) => (
              <section key={row.categoryId} className="book-row">
                <div className="row-label">
                  <b className="font-display">{row.label}</b>
                  <span>
                    {t('shelf.count', { count: row.posts.length })} · {t('shelf.scrollHint')}
                  </span>
                </div>
                <ul className="books">
                  {row.posts.map((post) => {
                    const metrics = spineMetrics(post.id, post.likeCount);
                    const isSelected = selected?.id === post.id;
                    return (
                      <li key={post.id}>
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          aria-label={post.title}
                          className={cn(
                            'spine',
                            cardTone(post.id),
                            isSelected && 'is-selected'
                          )}
                          style={{
                            height: metrics.height,
                            width: metrics.width,
                          }}
                          onClick={() => setSelectedId(post.id)}
                        >
                          {SHOW_USER_IDENTITY ? (
                            <small>{post.user.name}</small>
                          ) : null}
                          <b>{post.title}</b>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      <aside className="reading-slip" aria-live="polite">
        <small>{t('shelf.nowInHand')}</small>
        {selected ? (
          <>
            <p className="slip-kind">{selectedCategory?.name ?? t('shelf.uncategorized')}</p>
            <h2 className="font-display">{selected.title}</h2>
            {SHOW_USER_IDENTITY ? (
              <div className="slip-person">
                <UserAvatar
                  userId={selected.user.id}
                  name={selected.user.name}
                  avatarUrl={selected.user.avatarUrl}
                  className="w-8 h-8"
                />
                <span>{selected.user.name}</span>
              </div>
            ) : null}
            {quote ? <blockquote>「{quote}」</blockquote> : null}
            <p className="slip-likes">
              <Heart className="w-3.5 h-3.5 fill-brand text-brand" />
              {selected.likeCount}
            </p>
            <div className="slip-actions">
              <Button asChild>
                <Link href={`/post/${selected.id}`}>{t('shelf.openPost')}</Link>
              </Button>
              <BookmarkButton postId={selected.id} loginRedirect="/shelf" />
            </div>
            <p className="hint">{t('shelf.hint')}</p>
          </>
        ) : (
          <p className="hint">{t('shelf.hint')}</p>
        )}
      </aside>
    </div>
  );
}
