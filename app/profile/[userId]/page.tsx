'use client';

import { use } from 'react';
import Link from 'next/link';
import { PostCard } from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { usePostsByUser, useUser } from '@/lib/data/hooks';

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = use(params);
  const { t } = useTranslations();
  const { user, loading: userLoading } = useUser(userId);
  const { user: currentUser } = useAuth();
  const { posts, loading: postsLoading } = usePostsByUser(userId, currentUser?.id);

  const isSelf = userId === currentUser?.id;
  const loading = userLoading || postsLoading;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        {t('common.loading')}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 mb-4">{t('profile.notFound')}</p>
        <Button asChild>
          <Link href="/">{t('common.backToHome')}</Link>
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
            <p className="text-gray-500 text-sm">
              {t('profile.postCount', { count: posts.length })}
            </p>
          </div>
        </div>
        {isSelf && (
          <Button asChild variant="outline">
            <Link href="/profile/edit">{t('profile.editProfile')}</Link>
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
        <p className="text-center text-gray-500 py-12">{t('profile.noPosts')}</p>
      )}
    </div>
  );
}
