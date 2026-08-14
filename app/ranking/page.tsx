'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Heart, Users, Medal } from 'lucide-react';
import { PeriodFilter } from '@/components/PeriodFilter';
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
import { RANKING_PERIOD_LABELS, type RankingPeriod } from '@/types';

type RankingTab = 'posts' | 'genre' | 'users';
type UserSort = 'likes' | 'posts';

export default function RankingPage() {
  const [tab, setTab] = useState<RankingTab>('posts');
  const [period, setPeriod] = useState<RankingPeriod>('all');
  const [categoryId, setCategoryId] = useState<string>('youtube');
  const [userSort, setUserSort] = useState<UserSort>('likes');

  const { categories } = useMajorCategories();
  const activeCategoryId = tab === 'genre' ? categoryId : undefined;
  const { entries: postEntries, loading: postsLoading } = usePostRankings(
    period,
    activeCategoryId
  );
  const { entries: userEntries, loading: usersLoading } = useUserRankings(
    period,
    userSort
  );

  const tabs: { id: RankingTab; label: string; icon: React.ReactNode }[] = [
    { id: 'posts', label: '総合投稿', icon: <Trophy className="w-4 h-4" /> },
    { id: 'genre', label: 'ジャンル別', icon: <Medal className="w-4 h-4" /> },
    { id: 'users', label: 'ユーザー', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[#3b2a22] mb-1">
          ランキング
        </h1>
        <p className="text-sm text-[#6a5344]">
          {RANKING_PERIOD_LABELS[period]} · いいね数で並べています
        </p>
      </header>

      <div className="func-surface p-3 sm:p-4 mb-4 sticky top-[60px] z-20">
        <div className="flex flex-wrap gap-2 mb-3">
          {tabs.map((t) => (
            <Button
              key={t.id}
              type="button"
              size="sm"
              variant={tab === t.id ? 'flat' : 'flat-outline'}
              className="gap-2"
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              {t.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <PeriodFilter value={period} onChange={setPeriod} />

          {tab === 'genre' && (
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
              <SelectTrigger className="w-full sm:w-56 bg-white border-[#e4d2b8]">
                <SelectValue placeholder="ジャンルを選択" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}

          {tab === 'users' && (
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={userSort === 'likes' ? 'flat' : 'flat-outline'}
                onClick={() => setUserSort('likes')}
              >
                獲得いいね数
              </Button>
              <Button
                type="button"
                size="sm"
                variant={userSort === 'posts' ? 'flat' : 'flat-outline'}
                onClick={() => setUserSort('posts')}
              >
                投稿数
              </Button>
            </div>
          )}
        </div>
      </div>

      {(tab === 'posts' || tab === 'genre') && (
        <section className="func-surface overflow-hidden">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 text-[11px] font-bold tracking-wide text-[#8a6a52] border-b border-[#efe3d2] bg-[#faf4eb]">
            <span className="w-10">順位</span>
            <span className="flex-1">投稿</span>
            <span className="w-16 text-right">いいね</span>
          </div>
          {postsLoading ? (
            <p className="text-center text-[#8a6a52] py-12">読み込み中...</p>
          ) : postEntries.length === 0 ? (
            <p className="text-center text-[#8a6a52] py-12">
              この期間のデータはありません
            </p>
          ) : (
            <ol>
              {postEntries.map((entry) => (
                <li key={entry.post.id}>
                  <Link href={`/post/${entry.post.id}`} className="func-row">
                    <span
                      className={`tabular w-10 h-10 flex-shrink-0 flex items-center justify-center font-black text-lg rounded-md ${
                        entry.rank === 1
                          ? 'bg-[#3b2a22] text-[#fff7d6]'
                          : entry.rank <= 3
                            ? 'bg-[#ef7d3b] text-white'
                            : 'bg-[#f4ece0] text-[#3b2a22]'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#3b2a22] truncate">
                        {entry.post.title}
                      </p>
                      <p className="text-sm text-[#8a6a52] truncate">
                        {entry.post.user.name}
                      </p>
                    </div>
                    <span className="tabular flex items-center gap-1 font-bold text-[#c45c28] flex-shrink-0 w-16 justify-end">
                      <Heart className="w-4 h-4 fill-[#ef7d3b] text-[#ef7d3b]" />
                      {entry.likeCount}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {tab === 'users' && (
        <section className="func-surface overflow-hidden">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 text-[11px] font-bold tracking-wide text-[#8a6a52] border-b border-[#efe3d2] bg-[#faf4eb]">
            <span className="w-10">順位</span>
            <span className="flex-1">ユーザー</span>
            <span className="w-20 text-right">
              {userSort === 'likes' ? 'いいね' : '投稿数'}
            </span>
          </div>
          {usersLoading ? (
            <p className="text-center text-[#8a6a52] py-12">読み込み中...</p>
          ) : userEntries.length === 0 ? (
            <p className="text-center text-[#8a6a52] py-12">
              この期間のデータはありません
            </p>
          ) : (
            <ol>
              {userEntries.map((entry) => (
                <li key={entry.user.id}>
                  <Link href={`/profile/${entry.user.id}`} className="func-row">
                    <span
                      className={`tabular w-10 h-10 flex-shrink-0 flex items-center justify-center font-black text-lg rounded-md ${
                        entry.rank === 1
                          ? 'bg-[#3b2a22] text-[#fff7d6]'
                          : entry.rank <= 3
                            ? 'bg-[#ef7d3b] text-white'
                            : 'bg-[#f4ece0] text-[#3b2a22]'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <span className="text-2xl flex-shrink-0">
                      {entry.user.avatarUrl ?? '👤'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#3b2a22] truncate">
                        {entry.user.name}
                      </p>
                    </div>
                    <span className="tabular text-lg font-black text-[#3b2a22] w-20 text-right">
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
