'use client';

import Link from 'next/link';
import { Post, MajorCategory, SubCategory } from '@/types';
import { Heart } from 'lucide-react';
import { useMajorCategories, useSubCategories } from '@/lib/data/hooks';
import { cn } from '@/lib/utils';
import {
  categoryVisualStyle,
  postCardVisualClass,
  resolveCategoryIcon,
} from '@/lib/category-visual';
import { UserAvatar } from '@/components/user/UserAvatar';
import { SHOW_USER_IDENTITY } from '@/lib/auth/public-board';

interface PostCardProps {
  post: Post;
  categories?: MajorCategory[];
  subCategories?: SubCategory[];
  /** 検索結果など、ホバー持ち上げなし */
  flat?: boolean;
  featured?: boolean;
}

export function PostCard({
  post,
  categories: categoriesProp,
  subCategories: subCategoriesProp,
  flat = false,
  featured = false,
}: PostCardProps) {
  const { categories: categoriesFromHook } = useMajorCategories(!categoriesProp);
  const { subCategories: subCategoriesFromHook } = useSubCategories(
    !subCategoriesProp
  );
  const categories = categoriesProp ?? categoriesFromHook;
  const subCategories = subCategoriesProp ?? subCategoriesFromHook;

  const category = categories.find((c) => c.id === post.majorCategoryId);
  const subCategory = post.subCategoryId
    ? subCategories.find((c) => c.id === post.subCategoryId)
    : undefined;
  const majorLabel = category?.name;
  const categoryLabel = subCategory
    ? `${category?.name ?? ''} › ${subCategory.name}`
    : category?.name;
  const CategoryIcon = resolveCategoryIcon(category?.icon, category?.id);

  const quote =
    (post.description ?? '').length > 80
      ? `${(post.description ?? '').slice(0, 80)}…`
      : (post.description ?? '');

  return (
    <Link
      href={`/post/${post.id}`}
      prefetch={false}
      className={cn(
        'recommendation-card',
        postCardVisualClass(post.majorCategoryId, post.id),
        featured && 'card-featured',
        flat && 'is-flat'
      )}
      style={categoryVisualStyle(post.majorCategoryId)}
    >
      <div className="card-visual">
        {majorLabel ? (
          <span className="card-visual-badge">
            {CategoryIcon ? (
              <CategoryIcon className="card-visual-badge-icon" aria-hidden />
            ) : null}
            {majorLabel}
          </span>
        ) : null}
        {CategoryIcon ? (
          <CategoryIcon className="card-visual-icon" aria-hidden />
        ) : (
          <b aria-hidden="true">{post.title.slice(0, 1)}</b>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-[9px] font-bold tracking-widest uppercase">
          <span className="card-category-label inline-flex min-w-0 items-center gap-1">
            {CategoryIcon ? <CategoryIcon className="w-3 h-3 shrink-0" /> : null}
            <span className="truncate">{categoryLabel}</span>
          </span>
          <span className="flex items-center gap-1 text-quiet">
            <Heart className="w-3.5 h-3.5 fill-brand text-brand" />
            {post.likeCount}
          </span>
        </div>
        <h3 className="font-display mt-3 mb-1 text-base font-semibold leading-snug line-clamp-2">
          {post.title}
        </h3>
        {SHOW_USER_IDENTITY ? (
          <p className="text-[10px] text-quiet">{post.user.name}</p>
        ) : null}
        <blockquote className="mt-3 mb-4 min-h-[42px] font-display text-xs leading-relaxed text-ink/80 line-clamp-3">
          「{quote}」
        </blockquote>
        {SHOW_USER_IDENTITY ? (
          <div className="mt-auto flex items-center gap-2 text-[10px] text-quiet">
            <UserAvatar
              userId={post.user.id}
              name={post.user.name}
              avatarUrl={post.user.avatarUrl}
              className="w-6 h-6"
            />
            <span>by {post.user.name}</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
