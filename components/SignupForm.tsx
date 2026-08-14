'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';

export function SignupForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage('必須項目を入力してください');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('パスワードは6文字以上で入力してください');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setErrorMessage('パスワードが一致しません');
      return;
    }

    setIsSubmitting(true);

    const result = await signUp({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>新規登録</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold">ユーザー名</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="表示名"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold">メールアドレス</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold">パスワード</label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="6文字以上"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold">パスワード（確認）</label>
            <Input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? '登録中...' : 'アカウントを作成'}
          </Button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          すでにアカウントをお持ちの方は
          <Link href="/login" className="text-orange-600 font-semibold ml-1">
            ログイン
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
