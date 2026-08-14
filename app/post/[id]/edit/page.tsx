'use client';

import { use } from 'react';
import Link from 'next/link';
import { PostForm } from '@/components/PostForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { usePost } from '@/lib/data/hooks';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = use(params);
  const { post, loading } = usePost(id);
  const { user } = useAuth();

  const isOwner = post?.userId === user?.id;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">
        読み込み中...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 mb-4">投稿が見つかりません</p>
        <Button asChild>
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 mb-4">この投稿を編集する権限がありません</p>
        <Button asChild>
          <Link href={`/post/${id}`}>投稿に戻る</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-orange-950 mb-6">投稿を編集</h1>
      <PostForm initialPost={post} />
    </div>
  );
}
