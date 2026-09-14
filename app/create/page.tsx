'use client';

/** 新規投稿 `/create`。フォーム本体は PostForm（initialPost なし）。 */
import { PostForm } from '@/components/post/PostForm';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { useMajorCategories } from '@/lib/data/hooks';

export default function CreatePage() {
  const { t } = useTranslations();
  const { loading } = useMajorCategories();

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-quiet">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-2">
          {t('create.title')}
        </h1>
        <p className="text-quiet">{t('create.subtitle')}</p>
      </div>
      <PostForm />
    </div>
  );
}
