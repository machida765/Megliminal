'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryPicker } from '@/components/CategoryPicker';
import { getRepository } from '@/lib/data';
import { useAuth } from '@/components/providers/AuthProvider';
import { useMajorCategories, useSubCategories } from '@/lib/data/hooks';

interface PostFormProps {
  initialPost?: Post;
  onSubmit?: (post: Post) => void;
}

export function PostForm({ initialPost, onSubmit }: PostFormProps) {
  const router = useRouter();
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
      alert('必須項目を入力してください');
      return;
    }

    if (!user) {
      alert('ログインが必要です');
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
          `このジャンルはあと${frequency.daysRemaining}日後に投稿できます。`
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
        alert('投稿を更新しました');
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
        alert('投稿が公開されました！');
        router.push('/');
      }
    } catch {
      alert('保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? '投稿を編集' : '新しいおすすめを投稿'}
        </CardTitle>
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
            subLabel="中ジャンル（任意）"
          />

          <div className="space-y-2">
            <label className="block text-sm font-semibold">
              タイトル <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="例: iPad Pro 12.9inch (2024)"
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{formData.title.length} / 100</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold">
              なぜおすすめ？ <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="あなたの熱量をぶつけてください。"
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">
              {formData.description.length} / 1000
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold">リンク（任意）</label>
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
                ? '保存中...'
                : isEdit
                  ? '更新する'
                  : '投稿する'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              キャンセル
            </Button>
          </div>

          {!isEdit && (
            <div className="paper-note bg-[#fff7d6] p-4 rotate-1">
              <p className="text-sm text-[#6a5344]">
                大ジャンルごとに、1週間に1回まで投稿できます。中ジャンルは任意です。
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
