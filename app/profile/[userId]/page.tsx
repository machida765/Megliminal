'use client';

/** プロフィール `/profile/[userId]`。自分のときだけ編集ボタン。 */
import { use } from 'react';
import Link from 'next/link';
import { PostCard } from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { UserAvatar } from '@/components/user/UserAvatar';
import { usePostsByUser, useUser } from '@/lib/data/hooks';

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = use(params);
  const { t } = useTranslations();
  const { user, loading: userLoading } = useUser(userId);
  const { user: currentUser, signOut } = useAuth();
  const { posts, loading: postsLoading } = usePostsByUser(userId, currentUser?.id);

  const isSelf = userId === currentUser?.id;
  const loading = userLoading || postsLoading;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-quiet">
        {t('common.loading')}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-quiet mb-4">{t('profile.notFound')}</p>
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
          <UserAvatar
            userId={user.id}
            name={user.name}
            avatarUrl={user.avatarUrl}
            className="w-16 h-16"
          />
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold">
              {user.name}
            </h1>
            <p className="text-quiet text-sm">
              {t('profile.postCount', { count: posts.length })}
            </p>
          </div>
        </div>
        {isSelf && (
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/profile/edit">{t('profile.editProfile')}</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              {t('nav.logout')}
            </Button>
            <Link
              href="/profile/edit#delete-account"
              className="text-sm font-semibold text-[#9b2c1f] hover:underline"
            >
              {t('profile.withdraw')}
            </Link>
          </div>
        )}
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-center text-quiet py-12">{t('profile.noPosts')}</p>
      )}
    </div>
  );
}
