'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
  const [pending, setPending] = useState(false);
  /** サーバー確定値より先に見せる暫定状態。反映が終わったら null に戻す。 */
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);

  const { data: serverLiked = false, refetch } = useQuery({
    queryKey: ['isLiked', postId, user?.id ?? null],
    queryFn: () =>
      user ? getRepository().isLiked(user.id, postId) : Promise.resolve(false),
    enabled: Boolean(user),
  });

  const liked = optimisticLiked ?? serverLiked;
  const delta = liked === serverLiked ? 0 : liked ? 1 : -1;
  const count = Math.max(likeCount + delta, 0);

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
    setOptimisticLiked(nextLiked);

    try {
      const repo = getRepository();
      if (nextLiked) {
        await repo.addLike(user.id, postId);
      } else {
        await repo.removeLike(user.id, postId);
      }
      invalidate('posts', 'post', 'postsByUser', 'postRankings', 'userRankings');
      await refetch();
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
      disabled={pending}
      onClick={toggle}
      aria-pressed={liked}
    >
      <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
      {t('post.likes', { count })}
    </Button>
  );
}
