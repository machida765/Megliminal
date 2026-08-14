'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithPassword } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    setErrorMessage('');

    if (!formData.email || !formData.password) {
      setErrorMessage('メールアドレスとパスワードを入力してください');
      return;
    }

    setIsSubmitting(true);

    const result = await signInWithPassword(formData.email, formData.password);

    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            アカウントをお持ちでない方は
            <Link href="/signup" className="text-orange-600 font-semibold ml-1">
              新規登録
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
