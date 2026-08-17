'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryPicker } from '@/components/search/CategoryPicker';
import { getRepository } from '@/lib/data';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { useMajorCategories, useSubCategories } from '@/lib/data/hooks';

interface PostFormProps {
  initialPost?: Post;
  onSubmit?: (post: Post) => void;
}

export function PostForm({ initialPost, onSubmit }: PostFormProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const { user } = useAuth();
  const { categories } = useMajorCategories();
  const { subCategories } = useSubCategories();
  const isEdit = Boolean(initialPost);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    majorCategoryId: initialPost?.majorCategoryId ?? '',
    subCategoryId: initialPost?.subCategoryId ?? null as string | null,
    title: initialPost?.title ?? '',
    description: initialPost?.description ?? '',
    url: initialPost?.url ?? '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.majorCategoryId || !formData.title || !formData.description) {
      alert(t('post.requiredFields'));
      return;
    }

    if (!user) {
      alert(t('auth.errors.loginRequired'));
      router.push('/login?redirect=/create');
      return;
    }

    const repo = getRepository();

    if (!isEdit) {
      const frequency = await repo.checkPostFrequency(
        user.id,
        formData.majorCategoryId
      );
      if (!frequency.canPost) {
        alert(
          t('post.frequencyBlocked', { days: frequency.daysRemaining ?? 0 })
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isEdit && initialPost) {
        const updated = await repo.updatePost(initialPost.id, {
          majorCategoryId: formData.majorCategoryId,
          subCategoryId: formData.subCategoryId,
          title: formData.title,
          description: formData.description,
          url: formData.url || undefined,
        });
        onSubmit?.(updated);
        alert(t('post.updated'));
        router.push(`/post/${updated.id}`);
      } else {
        const newPost = await repo.createPost({
          userId: user.id,
          majorCategoryId: formData.majorCategoryId,
          subCategoryId: formData.subCategoryId,
          title: formData.title,
          description: formData.description,
          url: formData.url || undefined,
        });
        onSubmit?.(newPost);
        alert(t('post.published'));
        router.push('/');
      }
    } catch {
      alert(t('post.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? t('post.editTitle') : t('post.newTitle')}</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <CategoryPicker
            majorCategories={categories}
            subCategories={subCategories}
            majorCategoryId={formData.majorCategoryId || null}
            subCategoryId={formData.subCategoryId}
            onMajorChange={(majorCategoryId) =>
              setFormData((prev) => ({
                ...prev,
                majorCategoryId: majorCategoryId ?? '',
                subCategoryId:
                  prev.subCategoryId &&
                  subCategories.find((sub) => sub.id === prev.subCategoryId)
                    ?.majorCategoryId === majorCategoryId
                    ? prev.subCategoryId
                    : null,
              }))
            }
            onSubChange={(subCategoryId) =>
              setFormData((prev) => ({ ...prev, subCategoryId }))
            }
            majorRequired
            subOptional
          />

          <div className="space-y-2">
            <label className="block text-sm font-semibold">
              {t('post.titleLabel')} <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('post.titlePlaceholder')}
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{formData.title.length} / 100</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold">
              {t('post.whyRecommend')} <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('post.descriptionPlaceholder')}
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">
              {formData.description.length} / 1000
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold">{t('post.linkOptional')}</label>
            <Input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? t('post.saving')
                : isEdit
                  ? t('post.update')
                  : t('post.submit')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {t('common.cancel')}
            </Button>
          </div>

          {!isEdit && (
            <div className="paper-note bg-[#fff7d6] p-4 rotate-1">
              <p className="text-sm text-[#6a5344]">{t('post.frequencyNote')}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
