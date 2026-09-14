'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import {
  PUBLIC_BOARD,
  hasAnonLiked,
  markAnonLiked,
} from '@/lib/auth/public-board';
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
  const [pending, setPending] = useState(false);
  const [anonLiked, setAnonLiked] = useState(false);
  /** サーバー確定値より先に見せる暫定状態。反映が終わったら null に戻す。 */
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user && PUBLIC_BOARD) {
      setAnonLiked(hasAnonLiked(postId));
    }
  }, [user, postId]);

  const { data: serverLiked = false, refetch } = useQuery({
    queryKey: ['isLiked', postId, user?.id ?? null],
    queryFn: () =>
      user ? getRepository().isLiked(user.id, postId) : Promise.resolve(false),
    enabled: Boolean(user),
  });

  const liked = optimisticLiked ?? (user ? serverLiked : anonLiked);
  const baseline = user ? serverLiked : anonLiked;
  const delta = liked === baseline ? 0 : liked ? 1 : -1;
  const count = Math.max(likeCount + delta, 0);

  if (!user && !PUBLIC_BOARD) {
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
    if (!user && liked) return;

    const nextLiked = !liked;
    setPending(true);
    setOptimisticLiked(nextLiked);

    try {
      const repo = getRepository();
      if (nextLiked) {
        await repo.addLike(user?.id ?? null, postId);
        if (!user) {
          markAnonLiked(postId);
          setAnonLiked(true);
        }
      } else if (user) {
        await repo.removeLike(user.id, postId);
      }
      invalidate('posts', 'post', 'postsByUser', 'postRankings', 'userRankings');
      if (user) await refetch();
    } catch {
      // 失敗時はサーバー確定値に戻す
    } finally {
      setOptimisticLiked(null);
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant={liked ? 'default' : 'outline'}
      size="sm"
      className={cn('gap-1.5', className)}
      disabled={pending || (!user && liked)}
      onClick={toggle}
      aria-pressed={liked}
    >
      <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
      {t('post.likes', { count })}
    </Button>
  );
}
