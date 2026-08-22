'use client';

/** トップの見た目。props は HomePageData。 */
import { useMemo, useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PostCard } from '@/components/post/PostCard';
import { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Heart,
  ArrowRight,
  Trophy,
  Bookmark,
  Pencil,
  Sparkles,
} from 'lucide-react';
import type { HomePageData } from '@/lib/data/types';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { UserAvatar } from '@/components/user/UserAvatar';

type HomePageClientProps = HomePageData & {
  /** サーバー（または Local）がトップ用データを取った回数 */
  fetchCount?: number;
};

function pickRandomHero(candidates: Post[], fallback: Post | null): Post | null {
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  return fallback;
}

export function HomePageClient({
  recentPosts,
  popularPosts: popularPostsProp,
  rankingEntries,
  heroCandidates,
  stats,
  categories,
  subCategories,
  tags,
  fetchCount,
}: HomePageClientProps) {
  const router = useRouter();
  const { t, messages } = useTranslations();
  const [heroPost, setHeroPost] = useState<Post | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setHeroPost(
      pickRandomHero(heroCandidates, recentPosts[0] ?? popularPostsProp[0] ?? null)
    );
  }, [heroCandidates, recentPosts, popularPostsProp]);

  const popularPosts = useMemo(() => {
    return popularPostsProp
      .filter((post) => post.id !== heroPost?.id)
      .slice(0, 6);
  }, [popularPostsProp, heroPost]);

  const activeTags = tags.filter((tag) => tag.isActive).slice(0, 12);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-8">
      {fetchCount != null && fetchCount > 0 && (
        <p
          className="mb-4 inline-block paper-note bg-[#dbeafe] px-3 py-1.5 text-xs font-black text-[#1e40af] rotate-1"
          title={t('home.fetchCountHint')}
        >
          {t('home.fetchCount', { count: fetchCount })}
        </p>
      )}
      <div className="cork-frame p-4 sm:p-7 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
          {heroPost && (
            <div className="relative flex-1 paper-note bg-[#fff7d6] p-5 sm:p-7 -rotate-1">
              <span className="inline-block text-[11px] font-extrabold tracking-widest text-[#c45c28] mb-2">
                {t('home.heroBadge')}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black mb-3 hand-title text-[#3b2a22]">
                {heroPost.title}
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-[#6a5344] mb-5">
                {(heroPost.description ?? '').length > 160
                  ? `${(heroPost.description ?? '').slice(0, 160)}…`
                  : (heroPost.description ?? '')}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild>
                  <Link href={`/post/${heroPost.id}`}>
                    {t('home.viewDetail')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <span className="text-sm text-[#8a6a52] flex items-center gap-2">
                  <UserAvatar
                    userId={heroPost.user.id}
                    name={heroPost.user.name}
                    avatarUrl={heroPost.user.avatarUrl}
                    className="w-6 h-6"
                  />
                  {heroPost.user.name}
                </span>
              </div>
            </div>
          )}
          <div className="lg:w-44 mx-auto paper-note bg-[#ffe8d2] p-5 text-center rotate-3">
            <Heart className="w-6 h-6 mx-auto mb-1 fill-[#ef7d3b] text-[#ef7d3b]" />
            <div className="text-4xl font-black text-[#c45c28]">
              {heroPost?.likeCount ?? 0}
            </div>
            <div className="text-xs font-bold">{t('home.likesUnit')}</div>
            <p className="text-[11px] text-[#8a6a52] mt-2">{t('home.likesCaption')}</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="paper-note bg-[#fffdf8] p-3 sm:p-4 mb-8 rotate-[0.6deg] flex flex-col sm:flex-row gap-2"
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('home.searchPlaceholder')}
          className="flex-1"
        />
        <Button type="submit" className="gap-2">
          <Search className="w-4 h-4" />
          {t('home.search')}
        </Button>
        <Button asChild variant="outline" type="button">
          <Link href="/search">{t('nav.searchDetail')}</Link>
        </Button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <div className="paper-note bg-[#fff7d6] p-4 -rotate-2">
          <div className="text-xs font-extrabold text-[#c45c28]">
            {t('home.stats.postsLabel')}
          </div>
          <div className="text-3xl font-black">{stats.postCount}</div>
          <div className="text-xs">{t('home.stats.postsUnit')}</div>
        </div>
        <div className="paper-note bg-[#ffe8d2] p-4 rotate-1">
          <div className="text-xs font-extrabold text-[#c45c28]">
            {t('home.stats.likesLabel')}
          </div>
          <div className="text-3xl font-black">{stats.likeCount}</div>
          <div className="text-xs">{t('home.stats.likesUnit')}</div>
        </div>
        <div className="paper-note bg-[#fff1e4] p-4 -rotate-[1.2deg]">
          <div className="text-xs font-extrabold text-[#c45c28]">
            {t('home.stats.usersLabel')}
          </div>
          <div className="text-3xl font-black">{stats.userCount}</div>
          <div className="text-xs">{t('home.stats.usersUnit')}</div>
        </div>
        <div className="paper-note bg-[#fffdf6] p-4 rotate-2">
          <div className="text-xs font-extrabold text-[#c45c28]">
            {t('home.stats.genresLabel')}
          </div>
          <div className="text-3xl font-black">
            {categories.filter((c) => c.isActive).length}
          </div>
          <div className="text-xs">{t('home.stats.genresUnit')}</div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="font-black text-lg mb-4 -rotate-1 inline-block">
          {t('home.howTo.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="paper-note bg-[#fff7d6] p-4 rotate-1">
            <Sparkles className="w-5 h-5 text-[#c45c28] mb-2" />
            <h3 className="font-black mb-1">{t('home.howTo.step1Title')}</h3>
            <p className="text-sm text-[#6a5344]">{t('home.howTo.step1Body')}</p>
          </div>
          <div className="paper-note bg-[#ffe8d2] p-4 -rotate-1">
            <Bookmark className="w-5 h-5 text-[#c45c28] mb-2" />
            <h3 className="font-black mb-1">{t('home.howTo.step2Title')}</h3>
            <p className="text-sm text-[#6a5344]">{t('home.howTo.step2Body')}</p>
          </div>
          <div className="paper-note bg-[#fff1e4] p-4 rotate-2">
            <Pencil className="w-5 h-5 text-[#c45c28] mb-2" />
            <h3 className="font-black mb-1">{t('home.howTo.step3Title')}</h3>
            <p className="text-sm text-[#6a5344]">{t('home.howTo.step3Body')}</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-black text-lg rotate-1 inline-block">
            {t('home.recent.title')}
          </h2>
          <Link href="/search" className="text-sm font-bold text-[#c45c28]">
            {t('home.recent.viewAll')}
          </Link>
        </div>
        {recentPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                categories={categories}
                subCategories={subCategories}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-[#8a6a52]">{t('home.recent.empty')}</p>
        )}
      </section>

      <section className="mb-10">
        <h2 className="font-black text-lg mb-4 -rotate-1 inline-block">
          {t('home.popular.title')}
        </h2>
        {popularPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                categories={categories}
                subCategories={subCategories}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-[#8a6a52]">{t('home.popular.empty')}</p>
        )}
      </section>

      <section className="mb-10 grid grid-cols-1 lg:grid-cols-[1.2fr_.8fr] gap-4">
        <div className="func-surface overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#efe3d2] bg-[#faf4eb]">
            <h2 className="font-black flex items-center gap-2 text-[#3b2a22]">
              <Trophy className="w-4 h-4 text-[#c45c28]" />
              {t('home.ranking.title')}
            </h2>
            <Link href="/ranking" className="text-sm font-bold text-[#c45c28]">
              {t('home.ranking.viewAll')}
            </Link>
          </div>
          {rankingEntries.length === 0 ? (
            <p className="text-sm text-[#8a6a52] px-4 py-8 text-center">
              {t('home.ranking.empty')}
            </p>
          ) : (
            <ol>
              {rankingEntries.slice(0, 5).map((entry) => (
                <li key={entry.post.id}>
                  <Link href={`/post/${entry.post.id}`} className="func-row">
                    <span className="tabular w-7 font-black text-[#3b2a22]">
                      {entry.rank}
                    </span>
                    <span className="flex-1 truncate font-bold">
                      {entry.post.title}
                    </span>
                    <span className="tabular text-sm font-bold text-[#c45c28]">
                      ♥ {entry.likeCount}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="paper-note bg-[#fff7d6] p-5 rotate-1">
          <h2 className="font-black mb-3">{t('home.tags.title')}</h2>
          <div className="flex flex-wrap gap-2">
            {activeTags.map((tag, i) => (
              <Link
                key={tag.id}
                href="/search"
                className={`text-xs font-bold border border-[#e8c9a4] bg-white px-2 py-1 ${
                  i % 2 === 0 ? 'rotate-2' : '-rotate-2'
                }`}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
          <p className="text-xs text-[#8a6a52] mt-3">{t('home.tags.note')}</p>
        </div>
      </section>

      <div className="paper-note bg-[#fff1e4] p-6 max-w-xl -rotate-1">
        <h3 className="font-black text-lg mb-2">
          {t('app.aboutTitle', { name: messages.app.name })}
        </h3>
        <p className="text-sm text-[#6a5344] leading-relaxed">{t('app.aboutBody')}</p>
      </div>
    </div>
  );
}
