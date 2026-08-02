// components/LoginForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert('メールアドレスとパスワードを入力してください');
      return;
    }

    setIsSubmitting(true);

    // ダミー認証（実装は Phase 2 で Supabase に置き換え）
    setTimeout(() => {
      alert(`ログインしました: ${formData.email}`);
      setIsSubmitting(false);
      router.push('/');
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* メールアドレス */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">
                メールアドレス
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
              />
            </div>

            {/* パスワード */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">
                パスワード
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            {/* ログインボタン */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>

          {/* Phase 2への案内 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-yellow-900">
              ⚠️ <strong>開発中:</strong> 現在はダミー認証です。Phase 2でSupabase認証に置き換わります。
            </p>
          </div>

          {/* サインアップへのリンク */}
          <div className="text-center mt-4 text-sm text-gray-600">
            アカウントをお持ちでない方は
            <span className="text-blue-600 font-semibold ml-1">
              サインアップしてください
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
