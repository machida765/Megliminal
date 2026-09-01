'use client';

import { useState } from 'react';
import { Post, MajorCategory, SubCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { BookmarkButton } from '@/components/post/BookmarkButton';
import { LikeButton } from '@/components/post/LikeButton';
import { PostModerationActions } from '@/components/moderation/PostModerationActions';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { UserAvatar } from '@/components/user/UserAvatar';
import { LOCALE_DATE_FORMAT } from '@/lib/i18n/config';
import { getRepository } from '@/lib/data';
import { useInvalidate } from '@/lib/data/hooks';
import { getSafeHttpUrl } from '@/lib/validation/data';

interface PostDetailProps {
  post: Post;
  category?: MajorCategory;
  subCategory?: SubCategory;
  isOwner?: boolean;
  onHidden?: () => void;
  onDeleted?: () => void;
}

export function PostDetail({
  post,
  category,
  subCategory,
  isOwner = false,
  onHidden,
  onDeleted,
}: PostDetailProps) {
  const { t, locale } = useTranslations();
  const invalidate = useInvalidate();
  const safePostUrl = getSafeHttpUrl(post.url);
  const [deleting, setDeleting] = useState(false);
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

  const handleDelete = async () => {
    if (!confirm(t('post.deleteConfirm'))) return;

    setDeleting(true);
    try {
      await getRepository().deletePost(post.id);
      invalidate('posts', 'post', 'postsByUser', 'postRankings');
      onDeleted?.();
    } catch {
      alert(t('post.deleteFailed'));
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/">
          <Button variant="ghost" className="gap-2 -rotate-1">
            <ArrowLeft className="w-4 h-4" />
            {t('post.back')}
          </Button>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <BookmarkButton postId={post.id} />
          {isOwner && (
            <>
              <Link href={`/post/${post.id}/edit`}>
                <Button variant="outline" size="sm" className="rotate-1">
                  {t('post.edit')}
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-red-700 border-red-200 hover:bg-red-50 -rotate-1"
                disabled={deleting}
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? t('post.deleting') : t('post.delete')}
              </Button>
            </>
          )}
        </div>
      </div>

      <article className="paper-note bg-[#fffdf6] p-6 sm:p-8 mb-6 -rotate-[0.6deg]">
        <span className="inline-block text-[12px] font-extrabold text-[#c45c28] mb-3">
          {categoryLabel}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black mb-4 hand-title">{post.title}</h1>
        <div className="flex items-center gap-3 pb-4 border-b border-dashed border-[#e8c9a4] mb-6">
          <UserAvatar
            userId={post.user.id}
            name={post.user.name}
            avatarUrl={post.user.avatarUrl}
            className="w-10 h-10"
          />
          <div>
            <Link
              href={`/profile/${post.userId}`}
              className="font-black text-lg hover:text-[#c45c28]"
            >
              {post.user.name}
            </Link>
            <p className="text-sm text-[#8a6a52]">{formattedDate}</p>
          </div>
        </div>
        <h2 className="font-black mb-2 rotate-1 inline-block">{t('post.whyRecommend')}</h2>
        <p className="text-base leading-relaxed text-[#4a372c] whitespace-pre-wrap mb-6">
          {post.description}
        </p>
        <div className="mb-6">
          <LikeButton postId={post.id} likeCount={post.likeCount} />
        </div>
        {safePostUrl && (
          <a
            href={safePostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 paper-note bg-[#fff7d6] font-bold text-[#c45c28] rotate-1"
          >
            <ExternalLink className="w-4 h-4" />
            {t('post.viewDetail')}
          </a>
        )}
        {!isOwner && (
          <div className="pt-6 mt-6 border-t border-dashed border-[#e8c9a4]">
            <PostModerationActions postId={post.id} onHidden={onHidden} />
          </div>
        )}
      </article>

      <p className="paper-note bg-[#fff7d6] p-4 text-sm text-[#6a5344] rotate-1">
        {t('post.moreRecommendations')}
        <Link href="/search" className="font-black text-[#c45c28] mx-1">
          {t('nav.search')}
        </Link>
        {t('common.and')}
        <Link href="/ranking" className="font-black text-[#c45c28] mx-1">
          {t('nav.ranking')}
        </Link>
        {t('common.from')}
      </p>
    </>
  );
}
