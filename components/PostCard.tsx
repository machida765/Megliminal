// components/PostCard.tsx

'use client';

import Link from 'next/link';
import { Post } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ExternalLink, Heart } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { MAJOR_CATEGORIES } from '@/data/dummy';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const category = MAJOR_CATEGORIES.find((c) => c.id === post.majorCategoryId);
  const CategoryIcon = category?.icon
    ? (LucideIcons as any)[category.icon]
    : undefined;

  return (
    <Link href={`/post/${post.id}`} className="block h-full">
      <Card className="hover:shadow-md hover:shadow-orange-200/50 hover:-translate-y-0.5 hover:border-orange-200 transition-all duration-200 cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {category && (
                <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-[11px] font-semibold mb-2">
                  {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
                  {category.name}
                </span>
              )}
              <h3 className="font-bold text-lg leading-tight line-clamp-2 text-gray-900">
                {post.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <span>{post.user.avatarUrl}</span>
            <span>{post.user.name}</span>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {post.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">{formattedDate}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-rose-500 font-semibold">
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                {post.likeCount}
              </span>
              {post.url && <ExternalLink className="w-4 h-4 text-orange-500" />}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
