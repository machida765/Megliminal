'use client';

/** 投稿詳細 `/post/[id]`。本体は PostDetail。 */
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PostDetail } from '@/components/post/PostDetail';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { useMajorCategories, usePost, useSubCategories } from '@/lib/data/hooks';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default function PostPage({ params }: PostPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useTranslations();
  const { user } = useAuth();
  const { post, loading } = usePost(id, user?.id);
  const { categories } = useMajorCategories();
  const { subCategories } = useSubCategories();

  const category = categories.find((c) => c.id === post?.majorCategoryId);
  const subCategory = post?.subCategoryId
    ? subCategories.find((c) => c.id === post.subCategoryId)
    : undefined;
  const isOwner = post?.userId === user?.id;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">
        {t('common.loading')}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('post.notFound')}</h1>
        <p className="text-gray-600 mb-6">{t('post.notFoundDetail')}</p>
        <Button asChild>
          <Link href="/">{t('common.backToHome')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PostDetail
        post={post}
        category={category}
        subCategory={subCategory}
        isOwner={isOwner}
        onHidden={() => router.push('/')}
      />
    </div>
  );
}
