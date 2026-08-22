'use client';

/** 投稿編集 `/post/[id]/edit`。本人以外は編集不可。本体は PostForm。 */
import { use } from 'react';
import Link from 'next/link';
import { PostForm } from '@/components/post/PostForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { usePost } from '@/lib/data/hooks';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = use(params);
  const { t } = useTranslations();
  const { post, loading } = usePost(id);
  const { user } = useAuth();

  const isOwner = post?.userId === user?.id;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">
        {t('common.loading')}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 mb-4">{t('post.notFound')}</p>
        <Button asChild>
          <Link href="/">{t('common.backToHome')}</Link>
        </Button>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 mb-4">{t('post.noEditPermission')}</p>
        <Button asChild>
          <Link href={`/post/${id}`}>{t('post.backToPost')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-orange-950 mb-6">{t('post.editTitle')}</h1>
      <PostForm initialPost={post} />
    </div>
  );
}
