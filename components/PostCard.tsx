// components/PostCard.tsx

'use client';

import Link from 'next/link';
import { Post } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/post/${post.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg leading-tight line-clamp-2">
                {post.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <span>{post.user.avatarUrl}</span>
            <span>{post.user.name}</span>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-700 mb-3 line-clamp-3">
            {post.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formattedDate}</span>
            {post.url && (
              <ExternalLink className="w-4 h-4 text-blue-500" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
