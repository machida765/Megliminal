'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { getRepository } from '@/lib/data';

interface BookmarkButtonProps {
  postId: string;
  className?: string;
}

export function BookmarkButton({ postId, className }: BookmarkButtonProps) {
  const { t } = useTranslations();
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getRepository()
      .isBookmarked(user.id, postId)
      .then(setBookmarked);
  }, [user, postId]);

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className={className}>
        <Link href={`/login?redirect=/post/${postId}`}>
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
