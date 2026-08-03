// app/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { PostCard } from '@/components/PostCard';
import { POSTS } from '@/data/dummy';
import { Post } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, Flame, Heart, ArrowRight, Compass } from 'lucide-react';

export default function Home() {
  const [heroPost, setHeroPost] = useState<Post | null>(null);

  useEffect(() => {
    const highlyLikedPosts = POSTS.filter((post) => post.likeCount > 10);

    if (highlyLikedPosts.length > 0) {
      const randomIndex = Math.floor(Math.random() * highlyLikedPosts.length);
      setHeroPost(highlyLikedPosts[randomIndex]);
    }
  }, []);

  // 新着投稿（最大6件表示）
  const recentlyAddedPosts = useMemo(() => {
    return [...POSTS]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, []);

  // 人気投稿（ヒーローセクションを除く、最大6件表示）
  const popularPosts = useMemo(() => {
    return [...POSTS]
      .filter((post) => post.id !== heroPost?.id && post.likeCount > 5)
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 6);
  }, [heroPost]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ヒーローセクション */}
      {heroPost && (
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-400 shadow-xl shadow-orange-300/40 p-8 sm:p-10 mb-10 text-white">
          {/* 装飾ブロブ */}
          <div className="pointer-events-none absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-rose-300/30 blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-2/3">
              <span className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold tracking-wide mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                今週のイチオシ
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight drop-shadow-sm">
                {heroPost.title}
              </h2>
              <p className="text-base sm:text-lg mb-7 opacity-95 leading-relaxed">
                {heroPost.description.substring(0, 120)}
                {heroPost.description.length > 120 ? '...' : ''}
              </p>
              <Button asChild size="lg">
                <Link
                  href={`/post/${heroPost.id}`}
                  className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg"
                >
                  詳細を見る
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="md:w-1/3 flex justify-center">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex flex-col items-center justify-center text-white shadow-lg rotate-3">
                <Heart className="w-7 h-7 fill-white mb-1" />
                <span className="text-3xl font-black">{heroPost.likeCount}</span>
                <span className="text-[11px] opacity-90">いいね</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 検索画面への誘導 */}
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-dashed border-orange-200 bg-orange-50/60 mb-14 px-6 sm:px-10 py-10 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-300 mb-5">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-orange-950 mb-3">
          あなたのおすすめを見つけよう
        </h2>
        <p className="text-orange-800/70 mb-7 max-w-xl mx-auto">
          キーワード、カテゴリ、タグを組み合わせて、あなたにぴったりの「誰かの熱量」を探してみましょう。
        </p>
        <Button asChild size="lg">
          <Link href="/search">
            <Search className="w-4 h-4" />
            すべての投稿を検索する
          </Link>
        </Button>
      </div>

      {/* 新着投稿 */}
      <section className="mb-14">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-4 py-1.5 text-sm font-bold mb-6">
          <Sparkles className="w-4 h-4" />
          新着投稿
        </div>
        {recentlyAddedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlyAddedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">まだ投稿がありません</p>
        )}
      </section>

      {/* 人気投稿 */}
      <section className="mb-14">
        <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 rounded-full px-4 py-1.5 text-sm font-bold mb-6">
          <Flame className="w-4 h-4" />
          人気の投稿
        </div>
        {popularPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">まだ人気の投稿はありません</p>
        )}
      </section>

      {/* フッター */}
      <div className="mt-6 pt-10 border-t border-orange-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white border border-orange-100 shadow-sm shadow-orange-100/40 p-6 text-center md:text-left">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-3 mx-auto md:mx-0 text-lg">
              🎯
            </div>
            <h3 className="font-bold text-gray-900 mb-2">このサイトについて</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              SNSのアルゴリズムに疲れたあなたへ。純粋な「人のおすすめ」に出会えるプラットフォームです。
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-amber-100 shadow-sm shadow-amber-100/40 p-6 text-center md:text-left">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3 mx-auto md:mx-0 text-lg">
              📝
            </div>
            <h3 className="font-bold text-gray-900 mb-2">今後の予定</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Phase 2では Supabase でのデータ永続化、ユーザー認証を実装します。
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-rose-100 shadow-sm shadow-rose-100/40 p-6 text-center md:text-left">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3 mx-auto md:mx-0 text-lg">
              📱
            </div>
            <h3 className="font-bold text-gray-900 mb-2">スマホ対応</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Phase 3では React Native で iOS/Android アプリ化を予定しています。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
