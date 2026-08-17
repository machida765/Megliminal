'use client';

import Link from 'next/link';
import { Post, MajorCategory, SubCategory } from '@/types';
import { ExternalLink, Heart } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useMajorCategories, useSubCategories } from '@/lib/data/hooks';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { LOCALE_DATE_FORMAT } from '@/lib/i18n/config';
import { paperTone, tiltClass } from '@/lib/tilt';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  categories?: MajorCategory[];
  subCategories?: SubCategory[];
  /** 検索結果など、傾きなしで並べる */
  flat?: boolean;
}

export function PostCard({
  post,
  categories: categoriesProp,
  subCategories: subCategoriesProp,
  flat = false,
}: PostCardProps) {
  const { locale } = useTranslations();
  const { categories: categoriesFromHook } = useMajorCategories();
  const { subCategories: subCategoriesFromHook } = useSubCategories();
  const categories = categoriesProp ?? categoriesFromHook;
  const subCategories = subCategoriesProp ?? subCategoriesFromHook;

  const formattedDate = new Date(post.createdAt).toLocaleDateString(
    LOCALE_DATE_FORMAT[locale],
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  );

  const category = categories.find((c) => c.id === post.majorCategoryId);
  const subCategory = post.subCategoryId
    ? subCategories.find((c) => c.id === post.subCategoryId)
    : undefined;
  const categoryLabel = subCategory
    ? `${category?.name ?? ''} › ${subCategory.name}`
    : category?.name;
  const CategoryIcon = category?.icon
    ? (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[
        category.icon
      ]
    : undefined;

  return (
    <Link
      href={`/post/${post.id}`}
      className={cn(
        'block h-full p-4',
        flat
          ? 'func-surface hover:bg-[#fff6ea] transition-colors'
          : cn(
              'paper-note hover:rotate-0 hover:-translate-y-1 transition-transform',
              tiltClass(post.id),
              paperTone(post.id)
            )
      )}
    >
      {category && (
        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#c45c28] mb-2">
          {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
          {categoryLabel}
        </span>
      )}
      <h3 className="font-black text-[17px] leading-tight line-clamp-2 text-[#3b2a22] hand-title">
        {post.title}
      </h3>
      <div className="flex items-center gap-2 text-sm text-[#8a6a52] mt-2">
        <span>{post.user.avatarUrl}</span>
        <span>{post.user.name}</span>
      </div>
      <p className="text-sm text-[#6a5344] mt-3 mb-4 line-clamp-3 leading-relaxed">
        {post.description}
      </p>
      <div className="flex items-center justify-between text-xs text-[#8a6a52]">
        <span>{formattedDate}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#c45c28] font-bold">
            <Heart className="w-3.5 h-3.5 fill-[#ef7d3b] text-[#ef7d3b]" />
            {post.likeCount}
          </span>
          {post.url && <ExternalLink className="w-4 h-4 text-[#ef7d3b]" />}
        </div>
      </div>
    </Link>
  );
}
