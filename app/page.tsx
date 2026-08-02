// app/page.tsx

'use client';

import { useState, useMemo } from 'react';
import { CategoryGrid } from '@/components/CategoryGrid';
import { PostCard } from '@/components/PostCard';
import { MAJOR_CATEGORIES, POSTS } from '@/data/dummy';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // カテゴリに基づいてフィルタリング（アルゴリズムなし、純粋に新着順）
  const filteredPosts = useMemo(() => {
    if (!selectedCategory) {
      // 選択なし：すべての投稿を新着順で表示
      return [...POSTS].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // カテゴリ選択時：該当カテゴリのみ、新着順で表示
    return [...POSTS]
      .filter((post) => post.categoryId === selectedCategory)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          人のおすすめを探す
        </h2>
        <p className="text-gray-600">
          アルゴリズムに頼らず、カテゴリから「誰かの熱量」を探索できます。
        </p>
      </div>

      {/* カテゴリグリッド */}
      <CategoryGrid
        categories={MAJOR_CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 表示中のカテゴリ情報 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            {selectedCategory
              ? `${MAJOR_CATEGORIES.find((c) => c.id === selectedCategory)?.name}の投稿`
              : 'すべてのカテゴリ'}
            <span className="font-semibold text-gray-900 ml-2">
              ({filteredPosts.length}件)
            </span>
          </p>
        </div>
        <p className="text-xs text-gray-500">
          ✨ 新着順で表示（パーソナライズなし）
        </p>
      </div>

      {/* 投稿一覧 */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">
            このカテゴリにはまだ投稿がありません
          </p>
          <button className="text-blue-600 hover:underline font-semibold">
            最初の投稿をしてみましょう！
          </button>
        </div>
      )}

      {/* フッター */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🎯 このサイトについて</h3>
            <p className="text-sm text-gray-600">
              SNSのアルゴリズムに疲れたあなたへ。純粋な「人のおすすめ」に出会えるプラットフォームです。
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">📝 今後の予定</h3>
            <p className="text-sm text-gray-600">
              Phase 2では Supabase でのデータ永続化、ユーザー認証を実装します。
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">📱 スマホ対応</h3>
            <p className="text-sm text-gray-600">
              Phase 3では React Native で iOS/Android アプリ化を予定しています。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
