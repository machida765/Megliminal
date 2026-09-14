'use client';

/** ランキング `/ranking`。タブ: 投稿 / ジャンル。ユーザー別は SHOW_USER_IDENTITY 時のみ。 */
import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Heart, Users, Medal } from 'lucide-react';
import { PeriodFilter } from '@/components/search/PeriodFilter';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useMajorCategories,
  usePostRankings,
  useUserRankings,
} from '@/lib/data/hooks';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { UserAvatar } from '@/components/user/UserAvatar';
import { PageHeader } from '@/components/layout/PageHeader';
import { SHOW_USER_IDENTITY } from '@/lib/auth/public-board';
import { type RankingPeriod } from '@/types';

type RankingTab = 'posts' | 'genre' | 'users';
type UserSort = 'likes' | 'posts';

export default function RankingPage() {
  const { t, messages } = useTranslations();
  const [tab, setTab] = useState<RankingTab>('posts');
  const [period, setPeriod] = useState<RankingPeriod>('all');
  const [categoryId, setCategoryId] = useState<string>('youtube');
  const [userSort, setUserSort] = useState<UserSort>('likes');

  const { categories } = useMajorCategories();
  const activeTab = tab === 'users' && !SHOW_USER_IDENTITY ? 'posts' : tab;
  const activeCategoryId = activeTab === 'genre' ? categoryId : undefined;
  const { entries: postEntries, loading: postsLoading } = usePostRankings(
    period,
    activeCategoryId
  );
  const { entries: userEntries, loading: usersLoading } = useUserRankings(
    period,
    userSort
  );

  const periodLabel = messages.ranking.period[period];

  const tabs: { id: RankingTab; label: string; icon: React.ReactNode }[] = [
    { id: 'posts', label: t('ranking.tabs.posts'), icon: <Trophy className="w-4 h-4" /> },
    { id: 'genre', label: t('ranking.tabs.genre'), icon: <Medal className="w-4 h-4" /> },
    ...(SHOW_USER_IDENTITY
      ? [{ id: 'users' as const, label: t('ranking.tabs.users'), icon: <Users className="w-4 h-4" /> }]
      : []),
  ];

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        kicker={t('ranking.kicker')}
        title={t('ranking.title')}
        description={t('ranking.likesSortNote', { period: periodLabel })}
        icon={<Trophy className="w-3.5 h-3.5" />}
      />

      <div className="func-surface p-3 sm:p-4 mb-4 sticky top-14 md:top-[80px] z-20">
        <div className="flex flex-wrap gap-2 mb-3">
          {tabs.map((tabItem) => (
            <Button
              key={tabItem.id}
              type="button"
              size="sm"
              variant={activeTab === tabItem.id ? 'flat' : 'flat-outline'}
              className="gap-2"
              onClick={() => setTab(tabItem.id)}
            >
              {tabItem.icon}
              {tabItem.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <PeriodFilter value={period} onChange={setPeriod} />

          {activeTab === 'genre' && (
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
              <SelectTrigger className="w-full sm:w-56 bg-surface border-line">
                <SelectValue placeholder={t('ranking.selectGenre')}>
                  {selectedCategory?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id} label={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}

          {SHOW_USER_IDENTITY && activeTab === 'users' && (
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={userSort === 'likes' ? 'flat' : 'flat-outline'}
                onClick={() => setUserSort('likes')}
              >
                {t('ranking.userSort.likes')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={userSort === 'posts' ? 'flat' : 'flat-outline'}
                onClick={() => setUserSort('posts')}
              >
                {t('ranking.userSort.posts')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {(activeTab === 'posts' || activeTab === 'genre') && (
        <section className="func-surface overflow-hidden">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 text-[11px] font-bold tracking-wide text-quiet border-b border-line bg-soft/40">
            <span className="w-10">{t('ranking.table.rank')}</span>
            <span className="flex-1">{t('ranking.table.post')}</span>
            <span className="w-16 text-right">{t('ranking.table.likes')}</span>
          </div>
          {postsLoading ? (
            <p className="text-center text-quiet py-12">{t('common.loading')}</p>
          ) : postEntries.length === 0 ? (
            <p className="text-center text-quiet py-12">{t('ranking.noData')}</p>
          ) : (
            <ol>
              {postEntries.map((entry) => (
                <li key={entry.post.id}>
                  <Link href={`/post/${entry.post.id}`} className="func-row">
                    <span
                      className={`tabular w-10 h-10 flex-shrink-0 flex items-center justify-center font-black text-lg rounded-md ${
                        entry.rank === 1
                          ? 'bg-ink text-brand-ink'
                          : entry.rank <= 3
                            ? 'bg-brand text-brand-ink'
                            : 'bg-soft text-ink'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink truncate">
                        {entry.post.title}
                      </p>
                      {SHOW_USER_IDENTITY ? (
                        <p className="text-sm text-quiet truncate">
                          {entry.post.user.name}
                        </p>
                      ) : null}
                    </div>
                    <span className="tabular flex items-center gap-1 font-bold text-brand flex-shrink-0 w-16 justify-end">
                      <Heart className="w-4 h-4 fill-brand text-brand" />
                      {entry.likeCount}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {SHOW_USER_IDENTITY && activeTab === 'users' && (
        <section className="func-surface overflow-hidden">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 text-[11px] font-bold tracking-wide text-quiet border-b border-line bg-soft/40">
            <span className="w-10">{t('ranking.table.rank')}</span>
            <span className="flex-1">{t('ranking.table.user')}</span>
            <span className="w-20 text-right">
              {userSort === 'likes'
                ? t('ranking.table.likes')
                : t('ranking.table.postCount')}
            </span>
          </div>
          {usersLoading ? (
            <p className="text-center text-quiet py-12">{t('common.loading')}</p>
          ) : userEntries.length === 0 ? (
            <p className="text-center text-quiet py-12">{t('ranking.noData')}</p>
          ) : (
            <ol>
              {userEntries.map((entry) => (
                <li key={entry.user.id}>
                  <Link href={`/profile/${entry.user.id}`} className="func-row">
                    <span
                      className={`tabular w-10 h-10 flex-shrink-0 flex items-center justify-center font-black text-lg rounded-md ${
                        entry.rank === 1
                          ? 'bg-ink text-brand-ink'
                          : entry.rank <= 3
                            ? 'bg-brand text-brand-ink'
                            : 'bg-soft text-ink'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <UserAvatar
                      userId={entry.user.id}
                      name={entry.user.name}
                      avatarUrl={entry.user.avatarUrl}
                      className="w-8 h-8 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink truncate">
                        {entry.user.name}
                      </p>
                    </div>
                    <span className="tabular text-lg font-black text-ink w-20 text-right">
                      {entry.value}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}
