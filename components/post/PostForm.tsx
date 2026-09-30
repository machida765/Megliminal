'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryPicker } from '@/components/search/CategoryPicker';
import { PopupNotice } from '@/components/ui/popup-notice';
import { RequiredBadge } from '@/components/ui/required-badge';
import { getRepository } from '@/lib/data';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { ENFORCE_POST_FREQUENCY, PUBLIC_BOARD } from '@/lib/auth/public-board';
import { useInvalidate, useMajorCategories, useSubCategories } from '@/lib/data/hooks';

interface PostFormProps {
  initialPost?: Post;
  onSubmit?: (post: Post) => void;
}

export function PostForm({ initialPost, onSubmit }: PostFormProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const { user } = useAuth();
  const invalidate = useInvalidate();
  const { categories } = useMajorCategories();
  const { subCategories } = useSubCategories();
  const isEdit = Boolean(initialPost);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequiredPopup, setShowRequiredPopup] = useState(false);
  const [invalidFields, setInvalidFields] = useState({
    major: false,
    title: false,
  });

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
    if (name === 'title') {
      setInvalidFields((prev) => ({ ...prev, title: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const majorMissing = !formData.majorCategoryId;
    const titleMissing = !formData.title.trim();
    if (majorMissing || titleMissing) {
      setInvalidFields({ major: majorMissing, title: titleMissing });
      setShowRequiredPopup(true);
      return;
    }

    if (!user) {
      if (!PUBLIC_BOARD) {
        alert(t('auth.errors.loginRequired'));
        router.push('/login?redirect=/create');
        return;
      }
    }

    const repo = getRepository();

    // いったん週1制限はオフ。戻すときは ENFORCE_POST_FREQUENCY を true にする。
    if (ENFORCE_POST_FREQUENCY && !isEdit && user) {
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
          url: formData.url || null,
        });
        invalidate('posts', 'post', 'postsByUser', 'postRankings');
        onSubmit?.(updated);
        alert(t('post.updated'));
        router.push(`/post/${updated.id}`);
      } else {
        const newPost = await repo.createPost({
          userId: user?.id,
          majorCategoryId: formData.majorCategoryId,
          subCategoryId: formData.subCategoryId,
          title: formData.title,
          description: formData.description,
          url: formData.url || undefined,
        });
        invalidate('posts', 'post', 'postsByUser', 'postRankings');
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
    <>
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
            onMajorChange={(majorCategoryId) => {
              setInvalidFields((prev) => ({ ...prev, major: false }));
              setFormData((prev) => ({
                ...prev,
                majorCategoryId: majorCategoryId ?? '',
                subCategoryId:
                  prev.subCategoryId &&
                  subCategories.find((sub) => sub.id === prev.subCategoryId)
                    ?.majorCategoryId === majorCategoryId
                    ? prev.subCategoryId
                    : null,
              }));
            }}
            onSubChange={(subCategoryId) =>
              setFormData((prev) => ({ ...prev, subCategoryId }))
            }
            majorRequired
            majorInvalid={invalidFields.major}
            subOptional
          />

          <div className="space-y-2">
            <label className="block text-sm font-semibold">
              {t('post.titleLabel')}
              <RequiredBadge />
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('post.titlePlaceholder')}
              maxLength={100}
              aria-invalid={invalidFields.title || undefined}
              className={
                invalidFields.title ? 'border-red-500 ring-3 ring-red-500/20' : undefined
              }
            />
            <p className="text-xs text-gray-500">{formData.title.length} / 100</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold">
              {t('post.whyRecommend')}
              <span className="ml-1 font-normal text-quiet">（任意）</span>
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

          {/* いったん非表示。戻すときは ENFORCE_POST_FREQUENCY を true にする。 */}
          {ENFORCE_POST_FREQUENCY && !isEdit && user ? (
            <div className="rounded-[14px] border border-line bg-soft/40 p-4">
              <p className="text-sm text-quiet">{t('post.frequencyNote')}</p>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
    {showRequiredPopup ? (
      <PopupNotice
        title={t('post.requiredPopupTitle')}
        message={t('post.requiredFields')}
        onClose={() => setShowRequiredPopup(false)}
      />
    ) : null}
    </>
  );
}
