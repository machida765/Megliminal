'use client';

/** トップの見た目。props は HomePageData。 */
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/post/PostCard';
import {
  ArrowRight,
  Heart,
  Pencil,
  Shuffle,
  Sparkles,
  Trophy,
} from 'lucide-react';
import type { HomePageData } from '@/lib/data/types';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { UserAvatar } from '@/components/user/UserAvatar';
import { SHOW_USER_IDENTITY } from '@/lib/auth/public-board';

type HomePageClientProps = HomePageData;

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
}: HomePageClientProps) {
  const { t } = useTranslations();
  const [heroPost, setHeroPost] = useState<Post | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const activeCategories = categories.filter((c) => c.isActive).slice(0, 4);
  const heroCategory = categories.find((c) => c.id === heroPost?.majorCategoryId);
  const heroQuote = heroPost
    ? (heroPost.description ?? '').length > 90
      ? `${(heroPost.description ?? '').slice(0, 90)}…`
      : (heroPost.description ?? '')
    : '';

  const shuffleHero = () => {
    setHeroPost(
      pickRandomHero(heroCandidates, recentPosts[0] ?? popularPostsProp[0] ?? null)
    );
  };

  return (
    <div className="home-sunroom">
      <section className="home-hero" id="top">
        <div className="relative max-w-[650px]">
          <p className="section-kicker">
            <Sparkles className="w-4 h-4" aria-hidden="true" /> {t('home.heroBadge')}
          </p>
          <h1>
            {t('home.heroTitleBefore')}
            <br />
            <em>{t('home.heroTitleEm')}</em>
          </h1>
          <p className="max-w-[540px] text-base leading-[1.9] text-quiet">{t('home.heroLead')}</p>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <Button className="h-12 px-6 text-[15px] w-full sm:w-auto" onClick={shuffleHero}>
              <Shuffle className="w-5 h-5" />
              {t('home.shuffle')}
            </Button>
            <Link
              href="#discover"
              className="inline-flex items-center gap-1.5 text-[15px] font-semibold hover:text-brand"
            >
              {t('home.browseRecommendations')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="home-hero-object">
          <div className="orbit orbit-one" aria-hidden="true" />
          <div className="orbit orbit-two" aria-hidden="true" />
          {heroPost ? (
            <>
              <Link href={`/post/${heroPost.id}`} className="featured-object no-underline text-inherit">
                <div className="featured-cover">
                  <span className="featured-cover-kicker">{t('home.todayPick')}</span>
                  <strong>{heroPost.title}</strong>
                  <small>{heroCategory?.name ?? t('home.todayBook')}</small>
                </div>
                <div className="featured-meta">
                  <span>{t('home.todayBook')}</span>
                  <strong className="font-display">{heroPost.title}</strong>
                  {SHOW_USER_IDENTITY ? (
                    <small>{heroPost.user.name}</small>
                  ) : null}
                </div>
              </Link>
              {heroQuote ? (
                <span className="floating-note note-one">「{heroQuote}」</span>
              ) : null}
              <span className="floating-note note-two">
                {heroCategory?.name ?? ''}
                {SHOW_USER_IDENTITY ? ` · ${heroPost.user.name}` : ''}
              </span>
            </>
          ) : (
            <div className="featured-cover">
              <span>{t('home.todayPick')}</span>
              <small>—</small>
            </div>
          )}
        </div>
      </section>

      <div className="relative z-[1] px-[4vw]" id="discover">
        <section className="py-12 sm:py-[70px]">
          <div className="mb-5 sm:mb-7 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div>
              <p className="section-kicker">{t('home.recentKicker')}</p>
              <h2 className="font-display mt-2 text-[clamp(25px,3vw,40px)] font-semibold tracking-tight">
                {t('home.recent.title')}
              </h2>
            </div>
            <Link href="/search" className="inline-flex items-center gap-1 text-xs font-semibold hover:text-brand">
              {t('home.recent.viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentPosts.length > 0 ? (
            <div className="recommendation-grid">
              {recentPosts.slice(0, 4).map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  categories={categories}
                  subCategories={subCategories}
                  featured={index === 0}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-quiet">{t('home.recent.empty')}</p>
          )}
        </section>

        {popularPosts.length > 0 && (
          <section className="pb-12 sm:pb-[70px]">
            <div className="mb-7">
              <p className="section-kicker">{t('home.popularKicker')}</p>
              <h2 className="font-display mt-2 text-[clamp(25px,3vw,40px)] font-semibold tracking-tight">
                {t('home.popular.title')}
              </h2>
            </div>
            <div className="recommendation-grid">
              {popularPosts.slice(0, 4).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  categories={categories}
                  subCategories={subCategories}
                />
              ))}
            </div>
          </section>
        )}

        {/* いったん非表示: ジャンル棚 */}
        {false && activeCategories.length > 0 && (
          <section className="border-t border-line py-12 sm:py-[70px]" id="shelves">
            <div className="mb-5 sm:mb-7">
              <p className="section-kicker">{t('home.shelvesKicker')}</p>
              <h2 className="font-display mt-2 text-[clamp(25px,3vw,40px)] font-semibold tracking-tight">
                {t('home.shelvesTitle')}
              </h2>
              <p className="mt-2 text-xs text-quiet">{t('home.shelvesLead')}</p>
            </div>
            <div className="shelf-list">
              {activeCategories.map((category, i) => (
                <Link
                  key={category.id}
                  href={`/search?major=${encodeURIComponent(category.id)}`}
                  className={`shelf shelf-${i + 1}`}
                >
                  <span>0{i + 1}</span>
                  <strong className="font-display text-xl leading-snug">{category.name}</strong>
                  <small className="text-[8px] tracking-wider">{t('home.stats.genresUnit')}</small>
                  <ArrowRight className="w-[18px] self-end" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* いったん非表示: 統計 */}
        {false && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 py-10">
            <div className="rounded-[14px] border border-line bg-surface p-4">
              <div className="text-xs font-bold text-brand">{t('home.stats.postsLabel')}</div>
              <div className="font-display text-3xl font-semibold">{stats.postCount}</div>
              <div className="text-xs text-quiet">{t('home.stats.postsUnit')}</div>
            </div>
            <div className="rounded-[14px] border border-line bg-surface p-4">
              <div className="text-xs font-bold text-brand">{t('home.stats.likesLabel')}</div>
              <div className="font-display text-3xl font-semibold">{stats.likeCount}</div>
              <div className="text-xs text-quiet">{t('home.stats.likesUnit')}</div>
            </div>
            <div className="rounded-[14px] border border-line bg-surface p-4">
              <div className="text-xs font-bold text-brand">{t('home.stats.usersLabel')}</div>
              <div className="font-display text-3xl font-semibold">{stats.userCount}</div>
              <div className="text-xs text-quiet">{t('home.stats.usersUnit')}</div>
            </div>
            <div className="rounded-[14px] border border-line bg-surface p-4">
              <div className="text-xs font-bold text-brand">{t('home.stats.genresLabel')}</div>
              <div className="font-display text-3xl font-semibold">
                {categories.filter((c) => c.isActive).length}
              </div>
              <div className="text-xs text-quiet">{t('home.stats.genresUnit')}</div>
            </div>
          </section>
        )}

        <section className="pb-10">
          <h2 className="font-display mb-4 text-lg font-semibold">{t('home.howTo.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-[14px] border border-line bg-surface p-4">
              <Sparkles className="w-5 h-5 text-brand mb-2" />
              <h3 className="font-semibold mb-1">{t('home.howTo.step1Title')}</h3>
              <p className="text-sm text-quiet">{t('home.howTo.step1Body')}</p>
            </div>
            <div className="rounded-[14px] border border-line bg-surface p-4">
              <Pencil className="w-5 h-5 text-brand mb-2" />
              <h3 className="font-semibold mb-1">{t('home.howTo.step2Title')}</h3>
              <p className="text-sm text-quiet">{t('home.howTo.step2Body')}</p>
            </div>
            <div className="rounded-[14px] border border-line bg-surface p-4">
              <Heart className="w-5 h-5 text-brand mb-2" />
              <h3 className="font-semibold mb-1">{t('home.howTo.step3Title')}</h3>
              <p className="text-sm text-quiet">{t('home.howTo.step3Body')}</p>
            </div>
          </div>
        </section>
      </div>

      {/* いったん非表示: サービス説明・人気タグ・ランキング */}
      {false && (
        <section
          className="relative z-[1] grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-10 lg:gap-[7vw] bg-surface px-5 sm:px-[7vw] py-12 sm:py-[70px] border-t border-line"
          id="people"
        >
          <div>
            <p className="section-kicker">{t('home.voicesKicker')}</p>
            <blockquote className="font-display my-6 text-[clamp(22px,2.6vw,36px)] font-semibold leading-snug">
              {t('app.aboutBody')}
            </blockquote>
            {SHOW_USER_IDENTITY && heroPost ? (
              <div className="flex items-center gap-3">
                <UserAvatar
                  userId={heroPost!.user.id}
                  name={heroPost!.user.name}
                  avatarUrl={heroPost!.user.avatarUrl}
                  className="w-10 h-10"
                />
                <p className="m-0 flex flex-col">
                  <strong>{heroPost!.user.name}</strong>
                  <small className="text-quiet text-[9px] mt-1">{heroPost!.title}</small>
                </p>
              </div>
            ) : null}
          </div>
          <div>
            <p className="section-kicker">{t('home.popularKicker')}</p>
            <h2 className="font-display mt-2 mb-4 text-[clamp(25px,3vw,40px)] font-semibold">
              {t('home.popularTagsTitle')}
            </h2>
            <div className="tag-cloud">
              {activeTags.map((tag) => (
                <Link key={tag.id} href={`/search?tag=${encodeURIComponent(tag.id)}`}>
                  #{tag.name}
                </Link>
              ))}
            </div>
            <p className="text-xs text-quiet mt-3">{t('home.tags.note')}</p>
            <div className="func-surface overflow-hidden mt-8">
              <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-soft/40">
                <h2 className="font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-brand" />
                  {t('home.ranking.title')}
                </h2>
                <Link href="/ranking" className="text-sm font-semibold text-brand">
                  {t('home.ranking.viewAll')}
                </Link>
              </div>
              {rankingEntries.length === 0 ? (
                <p className="text-sm text-quiet px-4 py-8 text-center">
                  {t('home.ranking.empty')}
                </p>
              ) : (
                <ol>
                  {rankingEntries.slice(0, 5).map((entry) => (
                    <li key={entry.post.id}>
                      <Link href={`/post/${entry.post.id}`} className="func-row">
                        <span className="tabular w-7 font-semibold">{entry.rank}</span>
                        <span className="flex-1 truncate font-semibold">{entry.post.title}</span>
                        <span className="tabular text-sm font-semibold text-brand">
                          {entry.likeCount}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
