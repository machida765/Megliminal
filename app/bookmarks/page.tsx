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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        {t('common.loading')}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#fff7d6] mb-4 rotate-6 paper-note">
          <Bookmark className="w-7 h-7 text-[#c45c28]" />
        </div>
        <h1 className="text-2xl font-black mb-2 -rotate-1">{t('bookmarks.guestTitle')}</h1>
        <p className="text-gray-600 mb-6">{t('bookmarks.guestBody')}</p>
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
          <Bookmark className="w-7 h-7 text-orange-600" />
          <h1 className="text-3xl font-black -rotate-1 inline-block">{t('bookmarks.title')}</h1>
        </div>
        <p className="text-gray-600">{t('bookmarks.description')}</p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-12">{t('common.loading')}</p>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 paper-note bg-[#fff7d6] -rotate-1">
          <p className="text-gray-600 mb-4">{t('bookmarks.empty')}</p>
          <Button asChild variant="outline">
            <Link href="/search">{t('bookmarks.browse')}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
