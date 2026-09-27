'use client';

import { useRouter } from 'next/navigation';
import { Post, MajorCategory, SubCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BookmarkButton } from '@/components/post/BookmarkButton';
import { LikeButton } from '@/components/post/LikeButton';
import { PostModerationActions } from '@/components/moderation/PostModerationActions';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { UserAvatar } from '@/components/user/UserAvatar';
import { LOCALE_DATE_FORMAT } from '@/lib/i18n/config';
import { getSafeHttpUrl } from '@/lib/validation/data';
import { isIdentifiableUserId, PUBLIC_BOARD, SHOW_USER_IDENTITY } from '@/lib/auth/public-board';
import { readNavFrom } from '@/lib/search-view';

interface PostDetailProps {
  post: Post;
  category?: MajorCategory;
  subCategory?: SubCategory;
  isOwner?: boolean;
  onHidden?: () => void;
}

export function PostDetail({
  post,
  category,
  subCategory,
  isOwner = false,
  onHidden,
}: PostDetailProps) {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const safePostUrl = getSafeHttpUrl(post.url);
  const otherLabel = t('category.other');
  const categoryLabel = subCategory
    ? `${category?.name ?? otherLabel} › ${subCategory.name}`
    : category?.name || otherLabel;
  const formattedDate = new Date(post.createdAt).toLocaleDateString(
    LOCALE_DATE_FORMAT[locale],
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }
  );

  const handleBack = () => {
    const from = readNavFrom();
    if (from?.startsWith('/search')) {
      router.push(from);
      return;
    }
    router.push('/');
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" className="gap-2" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4" />
          {t('post.back')}
        </Button>
        {!PUBLIC_BOARD ? (
          <div className="flex flex-wrap items-center gap-2">
            <BookmarkButton postId={post.id} />
            {isOwner ? (
              <Link href={`/post/${post.id}/edit`}>
                <Button variant="outline" size="sm">
                  {t('post.edit')}
                </Button>
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <article className="rounded-[14px] border border-line bg-surface p-6 sm:p-8 mb-6">
        <span className="inline-block text-[12px] font-bold text-brand mb-3">
          {categoryLabel}
        </span>
        <h1 className="font-display text-2xl sm:text-4xl font-semibold mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 pb-4 border-b border-line mb-6">
          {SHOW_USER_IDENTITY ? (
            <UserAvatar
              userId={post.user.id}
              name={post.user.name}
              avatarUrl={post.user.avatarUrl}
              className="w-10 h-10"
            />
          ) : null}
          <div>
          {SHOW_USER_IDENTITY ? (
            isIdentifiableUserId(post.userId) ? (
            <Link
              href={`/profile/${post.userId}`}
              className="font-semibold text-lg hover:text-brand"
            >
              {post.user.name}
            </Link>
            ) : (
            <span className="font-semibold text-lg">{post.user.name}</span>
            )
          ) : null}
            <p className="text-sm text-quiet">{formattedDate}</p>
          </div>
        </div>
        {post.description.trim() ? (
          <>
            <h2 className="font-display font-semibold mb-2">{t('post.whyRecommend')}</h2>
            <p className="text-base leading-relaxed text-ink whitespace-pre-wrap mb-6">
              {post.description}
            </p>
          </>
        ) : null}
        <div className="mb-6">
          <LikeButton postId={post.id} likeCount={post.likeCount} />
        </div>
        {safePostUrl && (
          <a
            href={safePostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-[14px] border border-line bg-soft font-semibold text-brand"
          >
            <ExternalLink className="w-4 h-4" />
            {t('post.viewDetail')}
          </a>
        )}
        {!isOwner && (
          <div className="pt-6 mt-6 border-t border-line">
            <PostModerationActions postId={post.id} onHidden={onHidden} />
          </div>
        )}
      </article>

      <p className="rounded-[14px] border border-line bg-surface p-4 text-sm text-quiet">
        {t('post.moreRecommendations')}
        <Link href="/search" className="font-semibold text-brand mx-1">
          {t('nav.search')}
        </Link>
        {t('common.and')}
        <Link href="/ranking" className="font-semibold text-brand mx-1">
          {t('nav.ranking')}
        </Link>
        {t('common.from')}
      </p>
    </>
  );
}
