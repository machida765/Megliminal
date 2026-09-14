'use client';

/** ブックマーク `/bookmarks`。未ログインはログイン誘導。 */
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { PostCard } from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { useBookmarks } from '@/lib/data/hooks';

export default function BookmarksPage() {
  const { t } = useTranslations();
  const { user, loading: authLoading } = useAuth();
  const { posts, loading } = useBookmarks(user?.id);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-quiet">
        {t('common.loading')}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-soft mb-4 rounded-[14px]">
          <Bookmark className="w-7 h-7 text-brand" />
        </div>
        <h1 className="font-display text-2xl font-semibold mb-2">{t('bookmarks.guestTitle')}</h1>
        <p className="text-quiet mb-6">{t('bookmarks.guestBody')}</p>
        <Button asChild>
          <Link href="/login?redirect=/bookmarks">{t('bookmarks.login')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="w-7 h-7 text-brand" />
          <h1 className="font-display text-3xl font-semibold">{t('bookmarks.title')}</h1>
        </div>
        <p className="text-quiet">{t('bookmarks.description')}</p>
      </div>

      {loading ? (
        <p className="text-center text-quiet py-12">{t('common.loading')}</p>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-[14px] border border-line bg-surface">
          <p className="text-quiet mb-4">{t('bookmarks.empty')}</p>
          <Button asChild variant="outline">
            <Link href="/search">{t('bookmarks.browse')}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
