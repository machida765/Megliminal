// app/post/[id]/page.tsx

'use client';

import { PostDetail } from '@/components/PostDetail';
import { POSTS, MAJOR_CATEGORIES } from '@/data/dummy';

interface PostPageProps {
  params: {
    id: string;
  };
}

export default function PostPage({ params }: PostPageProps) {
  const post = POSTS.find((p) => p.id === params.id);
  const category = MAJOR_CATEGORIES.find((c) => c.id === post?.categoryId);

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            投稿が見つかりません
          </h1>
          <p className="text-gray-600 mb-6">
            お探しの投稿は削除されたか、URLが間違っている可能性があります。
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            ホームに戻る
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PostDetail post={post} category={category} />
    </div>
  );
}
