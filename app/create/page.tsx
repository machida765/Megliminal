'use client';

import { PostForm } from '@/components/PostForm';
import { useMajorCategories } from '@/lib/data/hooks';

export default function CreatePage() {
  const { loading } = useMajorCategories();

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 -rotate-1 inline-block hand-title">
          新しい紙を貼る
        </h1>
        <p className="text-[#6a5344]">
          あなたの「推し」を、少し斜めに貼ってください。
        </p>
      </div>
      <PostForm />
    </div>
  );
}
