'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { PUBLIC_BOARD } from '@/lib/auth/public-board';
import { getRepository } from '@/lib/data';
import { useInvalidate } from '@/lib/data/hooks';

interface BookmarkButtonProps {
  postId: string;
  className?: string;
  loginRedirect?: string;
}

export function BookmarkButton({
  postId,
  className,
  loginRedirect,
}: BookmarkButtonProps) {
  const { t } = useTranslations();
  const { user } = useAuth();
  const invalidate = useInvalidate();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getRepository()
      .isBookmarked(user.id, postId)
      .then(setBookmarked);
  }, [user, postId]);

  if (!user) {
    if (PUBLIC_BOARD) return null;
    return (
      <Button asChild variant="outline" size="sm" className={className}>
        <Link href={`/login?redirect=${encodeURIComponent(loginRedirect ?? `/post/${postId}`)}`}>
          <Bookmark className="w-4 h-4" />
          {t('post.bookmark')}
        </Link>
      </Button>
    );
  }

  const toggle = async () => {
    setLoading(true);
    const repo = getRepository();
    if (bookmarked) {
      await repo.removeBookmark(user.id, postId);
      setBookmarked(false);
    } else {
      await repo.addBookmark(user.id, postId);
      setBookmarked(true);
    }
    invalidate('bookmarks');
    setLoading(false);
  };

  return (
    <Button
      type="button"
      variant={bookmarked ? 'default' : 'outline'}
      size="sm"
      className={className}
      disabled={loading}
      onClick={toggle}
    >
      <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
      {bookmarked ? t('post.bookmarked') : t('post.bookmark')}
    </Button>
  );
}
