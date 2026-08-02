// components/PostForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Post } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { POSTS, USERS } from '@/data/dummy';

interface PostFormProps {
  categories: Category[];
  onSubmit?: (post: Post) => void;
}

export function PostForm({ categories, onSubmit }: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    url: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.title || !formData.description) {
      alert('必須項目を入力してください');
      return;
    }

    setIsSubmitting(true);

    // ダミーデータに投稿を追加（Phase 2でSupabaseに置き換え予定）
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: USERS[0].id, // ログイン機能実装まではダミーユーザーを使用
      user: USERS[0],
      categoryId: formData.categoryId,
      title: formData.title,
      description: formData.description,
      url: formData.url || undefined,
      createdAt: new Date().toISOString(),
    };

    // ダミーデータ配列に追加
    POSTS.unshift(newPost);

    if (onSubmit) {
      onSubmit(newPost);
    }

    // 成功メッセージ
    alert('投稿が公開されました！');

    // ホームに戻る
    router.push('/');
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>新しいおすすめを投稿</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* カテゴリ選択 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <Select value={formData.categoryId} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* タイトル */}
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
            <p className="text-xs text-gray-500">
              {formData.title.length} / 100
            </p>
          </div>

          {/* 説明・なぜおすすめ？ */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold">
              なぜおすすめ？（説明文）<span className="text-red-500">*</span>
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="あなたの熱量をぶつけてください。なぜこれをおすすめするのか、どんな魅力があるのか？を思う存分書いてください。"
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">
              {formData.description.length} / 1000
            </p>
          </div>

          {/* URL（オプション） */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold">
              リンク（オプション）
            </label>
            <Input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
            />
            <p className="text-xs text-gray-500">
              公式サイト、購入ページ、予約サイトなどを貼り付けてください
            </p>
          </div>

          {/* 送信ボタン */}
          <div className="pt-4 flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? '投稿中...' : '投稿する'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
          </div>

          {/* 注意事項 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              ℹ️ <strong>ご注意:</strong> 現在ローカル開発中のため、投稿はブラウザを閉じるとリセットされます。Phase 2でSupabaseを導入した際に永続化されます。
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
