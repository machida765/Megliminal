'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { getRepository } from '@/lib/data';
import { useInvalidate } from '@/lib/data/hooks';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  postId: string;
  likeCount: number;
  className?: string;
}

export function LikeButton({ postId, likeCount, className }: LikeButtonProps) {
  const { t } = useTranslations();
  const { user } = useAuth();
  const invalidate = useInvalidate();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likeCount);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setCount(likeCount);
  }, [likeCount]);

  useEffect(() => {
    if (!user) {
      setLiked(false);
      return;
    }

    let cancelled = false;
    getRepository()
      .isLiked(user.id, postId)
      .then((value) => {
        if (!cancelled) setLiked(value);
      });

    return () => {
      cancelled = true;
    };
  }, [user, postId]);

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className={cn('gap-1.5', className)}>
        <Link href={`/login?redirect=/post/${postId}`}>
          <Heart className="w-4 h-4" />
          {t('post.likes', { count })}
        </Link>
      </Button>
    );
  }

  const toggle = async () => {
    const nextLiked = !liked;
    setPending(true);
    setLiked(nextLiked);
    setCount((prev) => Math.max(prev + (nextLiked ? 1 : -1), 0));

    try {
      const repo = getRepository();
      if (nextLiked) {
        await repo.addLike(user.id, postId);
      } else {
        await repo.removeLike(user.id, postId);
      }
      invalidate('posts', 'post', 'postsByUser', 'postRankings', 'userRankings');
    } catch {
      setLiked(!nextLiked);
      setCount((prev) => Math.max(prev + (nextLiked ? -1 : 1), 0));
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant={liked ? 'default' : 'outline'}
      size="sm"
      className={cn('gap-1.5', className)}
      disabled={pending}
      onClick={toggle}
      aria-pressed={liked}
    >
      <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
      {t('post.likes', { count })}
    </Button>
  );
}
