'use client';

import { Post, MajorCategory, SubCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import { BookmarkButton } from '@/components/post/BookmarkButton';
import { PostModerationActions } from '@/components/moderation/PostModerationActions';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { UserAvatar } from '@/components/user/UserAvatar';

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
            <Link href={`/post/${post.id}/edit`}>
              <Button variant="outline" size="sm" className="rotate-1">
                {t('post.edit')}
              </Button>
            </Link>
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
        <div className="flex items-center gap-2 text-[#c45c28] font-black mb-6">
          <Heart className="w-5 h-5 fill-[#ef7d3b] text-[#ef7d3b]" />
          {t('post.likes', { count: post.likeCount })}
        </div>
        {post.url && (
          <a
            href={post.url}
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
