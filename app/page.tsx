'use client';

import { useMemo, useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PostCard } from '@/components/PostCard';
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
import {
  usePosts,
  useMajorCategories,
  useTags,
  usePostRankings,
} from '@/lib/data/hooks';
import { useAuth } from '@/components/providers/AuthProvider';
import { APP_NAME } from '@/lib/config/app';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { posts, loading } = usePosts(user?.id);
  const { categories } = useMajorCategories();
  const { tags } = useTags();
  const { entries: rankingEntries } = usePostRankings('week');
  const [heroPost, setHeroPost] = useState<Post | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const highlyLikedPosts = posts.filter((post) => post.likeCount > 10);
    if (highlyLikedPosts.length > 0) {
      const randomIndex = Math.floor(Math.random() * highlyLikedPosts.length);
      setHeroPost(highlyLikedPosts[randomIndex]);
    } else {
      setHeroPost(posts[0] ?? null);
    }
  }, [posts]);

  const recentlyAddedPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [posts]);

  const popularPosts = useMemo(() => {
    return [...posts]
      .filter((post) => post.id !== heroPost?.id)
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 6);
  }, [posts, heroPost]);

  const totalLikes = useMemo(
    () => posts.reduce((sum, post) => sum + post.likeCount, 0),
    [posts]
  );
  const userCount = useMemo(
    () => new Set(posts.map((p) => p.userId)).size,
    [posts]
  );
  const activeTags = tags.filter((t) => t.isActive).slice(0, 12);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-[#8a6a52]">
        掲示板、貼り直し中...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-8">
      <div className="cork-frame p-4 sm:p-7 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
          {heroPost && (
            <div className="relative flex-1 paper-note bg-[#fff7d6] p-5 sm:p-7 -rotate-1">
              <span className="inline-block text-[11px] font-extrabold tracking-widest text-[#c45c28] mb-2">
                ★ 今週のイチオシ（てきとうに貼った）
              </span>
              <h2 className="text-2xl sm:text-4xl font-black mb-3 hand-title text-[#3b2a22]">
                {heroPost.title}
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-[#6a5344] mb-5">
                {heroPost.description.substring(0, 160)}
                {heroPost.description.length > 160 ? '…' : ''}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild>
                  <Link href={`/post/${heroPost.id}`}>
                    詳細を見る
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <span className="text-sm text-[#8a6a52]">
                  {heroPost.user.avatarUrl} {heroPost.user.name}
                </span>
              </div>
            </div>
          )}
          <div className="lg:w-44 mx-auto paper-note bg-[#ffe8d2] p-5 text-center rotate-3">
            <Heart className="w-6 h-6 mx-auto mb-1 fill-[#ef7d3b] text-[#ef7d3b]" />
            <div className="text-4xl font-black text-[#c45c28]">
              {heroPost?.likeCount ?? 0}
            </div>
            <div className="text-xs font-bold">いいね</div>
            <p className="text-[11px] text-[#8a6a52] mt-2">手書きの数字、という体</p>
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
          placeholder="キーワードで探す（カテゴリ・タグは検索ページでも可）"
          className="flex-1"
        />
        <Button type="submit" className="gap-2">
          <Search className="w-4 h-4" />
          探す
        </Button>
        <Button asChild variant="outline" type="button">
          <Link href="/search">詳しく</Link>
        </Button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <div className="paper-note bg-[#fff7d6] p-4 -rotate-2">
          <div className="text-xs font-extrabold text-[#c45c28]">いま貼ってある</div>
          <div className="text-3xl font-black">{posts.length}</div>
          <div className="text-xs">件の投稿</div>
        </div>
        <div className="paper-note bg-[#ffe8d2] p-4 rotate-1">
          <div className="text-xs font-extrabold text-[#c45c28]">累計いいね</div>
          <div className="text-3xl font-black">{totalLikes}</div>
          <div className="text-xs">♥ の数</div>
        </div>
        <div className="paper-note bg-[#fff1e4] p-4 -rotate-[1.2deg]">
          <div className="text-xs font-extrabold text-[#c45c28]">書いてる人</div>
          <div className="text-3xl font-black">{userCount}</div>
          <div className="text-xs">人くらい</div>
        </div>
        <div className="paper-note bg-[#fffdf6] p-4 rotate-2">
          <div className="text-xs font-extrabold text-[#c45c28]">ジャンル</div>
          <div className="text-3xl font-black">
            {categories.filter((c) => c.isActive).length}
          </div>
          <div className="text-xs">大カテゴリ</div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="font-black text-lg mb-4 -rotate-1 inline-block">
          使い方（ざっくり）
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="paper-note bg-[#fff7d6] p-4 rotate-1">
            <Sparkles className="w-5 h-5 text-[#c45c28] mb-2" />
            <h3 className="font-black mb-1">1. 眺める</h3>
            <p className="text-sm text-[#6a5344]">アルゴリズムなし。人が貼った順と、いいねが多い順。</p>
          </div>
          <div className="paper-note bg-[#ffe8d2] p-4 -rotate-1">
            <Bookmark className="w-5 h-5 text-[#c45c28] mb-2" />
            <h3 className="font-black mb-1">2. 取っておく</h3>
            <p className="text-sm text-[#6a5344]">後で見たいものは保存。ログインすると使えます。</p>
          </div>
          <div className="paper-note bg-[#fff1e4] p-4 rotate-2">
            <Pencil className="w-5 h-5 text-[#c45c28] mb-2" />
            <h3 className="font-black mb-1">3. 週に1回まで</h3>
            <p className="text-sm text-[#6a5344]">大ジャンルごとに、1週間に1投稿。熱量を濃くするため。</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-black text-lg rotate-1 inline-block">新着（まだ乾いてない）</h2>
          <Link href="/search" className="text-sm font-bold text-[#c45c28]">
            全部見る →
          </Link>
        </div>
        {recentlyAddedPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyAddedPosts.map((post) => (
              <PostCard key={post.id} post={post} categories={categories} />
            ))}
          </div>
        ) : (
          <p className="text-center text-[#8a6a52]">まだ投稿がありません</p>
        )}
      </section>

      <section className="mb-10">
        <h2 className="font-black text-lg mb-4 -rotate-1 inline-block">人気（画鋲が多い）</h2>
        {popularPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularPosts.map((post) => (
              <PostCard key={post.id} post={post} categories={categories} />
            ))}
          </div>
        ) : (
          <p className="text-center text-[#8a6a52]">まだ人気の投稿はありません</p>
        )}
      </section>

      <section className="mb-10 grid grid-cols-1 lg:grid-cols-[1.2fr_.8fr] gap-4">
        <div className="func-surface overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#efe3d2] bg-[#faf4eb]">
            <h2 className="font-black flex items-center gap-2 text-[#3b2a22]">
              <Trophy className="w-4 h-4 text-[#c45c28]" />
              今週のランキング
            </h2>
            <Link href="/ranking" className="text-sm font-bold text-[#c45c28]">
              すべて見る
            </Link>
          </div>
          {rankingEntries.length === 0 ? (
            <p className="text-sm text-[#8a6a52] px-4 py-8 text-center">
              まだ集計できるいいねがありません
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
          <h2 className="font-black mb-3">タグの切れ端</h2>
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
          <p className="text-xs text-[#8a6a52] mt-3">
            横断タグ。大カテゴリには縛られません。
          </p>
        </div>
      </section>

      <div className="paper-note bg-[#fff1e4] p-6 max-w-xl -rotate-1">
        <h3 className="font-black text-lg mb-2">{APP_NAME}について</h3>
        <p className="text-sm text-[#6a5344] leading-relaxed">
          SNSのアルゴリズムに疲れたあなたへ。純粋な「人のおすすめ」に出会える掲示板です。
          きれいに並べすぎないのは、意図です。誰かが急いで貼った紙みたいな場所にしたい。
        </p>
      </div>
    </div>
  );
}
