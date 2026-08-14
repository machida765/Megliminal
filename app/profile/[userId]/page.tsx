'use client';

import { use } from 'react';
import Link from 'next/link';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { usePostsByUser, useUser } from '@/lib/data/hooks';

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = use(params);
  const { user, loading: userLoading } = useUser(userId);
  const { user: currentUser } = useAuth();
  const { posts, loading: postsLoading } = usePostsByUser(userId, currentUser?.id);

  const isSelf = userId === currentUser?.id;
  const loading = userLoading || postsLoading;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        読み込み中...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 mb-4">ユーザーが見つかりません</p>
        <Button asChild>
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{user.avatarUrl ?? '👤'}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black -rotate-1 inline-block hand-title">
              {user.name}
            </h1>
            <p className="text-gray-500 text-sm">{posts.length} 件の投稿</p>
          </div>
        </div>
        {isSelf && (
          <Button asChild variant="outline">
            <Link href="/profile/edit">プロフィールを編集</Link>
          </Button>
        )}
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-12">まだ投稿がありません</p>
      )}
    </div>
  );
}
