// components/PostDetail.tsx

'use client';

import { Post, Category } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PostDetailProps {
  post: Post;
  category?: Category;
}

export function PostDetail({ post, category }: PostDetailProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <>
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            戻る
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {category?.name || 'その他'}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            </div>

            <div className="flex items-center gap-3 pb-4 border-b">
              <span className="text-2xl">{post.user.avatarUrl}</span>
              <div>
                <p className="font-semibold text-lg">{post.user.name}</p>
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">
              💭 なぜおすすめ？
            </h2>
            <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
              {post.description}
            </p>
          </div>

          {post.url && (
            <div className="pt-4 border-t">
              <h2 className="text-lg font-semibold mb-3">🔗 リンク</h2>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-600 font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                詳細を見る
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 関連投稿へのナビゲーション案内 */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">
            💡 同じカテゴリの別のおすすめを探す場合は、
            <Link href="/" className="text-blue-600 hover:underline font-semibold">
              ホームに戻る
            </Link>
            からカテゴリを選択してください。
          </p>
        </CardContent>
      </Card>
    </>
  );
}
