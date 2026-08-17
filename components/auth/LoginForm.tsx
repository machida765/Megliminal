'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslations();
  const { signInWithPassword } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('error') === 'auth_callback') {
      setErrorMessage(t('auth.errors.oauthCallback'));
    }
  }, [searchParams, t]);

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
      setErrorMessage(t('auth.login.errorRequired'));
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
          <CardTitle>{t('auth.login.title')}</CardTitle>
        </CardHeader>

        <CardContent>
          <GoogleSignInButton onError={setErrorMessage} />
          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold">
                {t('auth.login.email')}
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
                {t('auth.login.password')}
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
              {isSubmitting ? t('auth.login.submitting') : t('auth.login.title')}
            </Button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            {t('auth.login.noAccount')}
            <Link href="/signup" className="text-orange-600 font-semibold ml-1">
              {t('auth.login.signupLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}
