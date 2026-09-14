'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { getSafeRedirectPath } from '@/lib/auth/safe-redirect';

type LoginFormProps = {
  defaultRedirect?: string;
  /** メール・パスワード・送信だけ出す（管理者ログイン用） */
  minimal?: boolean;
};

function LoginFormInner({
  defaultRedirect = '/',
  minimal = false,
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslations();
  const { signInWithPassword } = useAuth();
  const redirectTo = getSafeRedirectPath(
    searchParams.get('redirect'),
    defaultRedirect
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const resetSuccess = searchParams.get('reset') === 'success';
  const oauthError =
    searchParams.get('error') === 'auth_callback'
      ? t('auth.errors.oauthCallback')
      : '';
  const errorMessage = submitError || oauthError;

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
    setSubmitError('');

    if (!formData.email || !formData.password) {
      setSubmitError(t('auth.login.errorRequired'));
      return;
    }

    setIsSubmitting(true);

    const result = await signInWithPassword(formData.email, formData.password);

    setIsSubmitting(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        {minimal ? null : (
          <CardHeader>
            <CardTitle>{t('auth.login.title')}</CardTitle>
          </CardHeader>
        )}

        <CardContent>
          {minimal ? null : (
            <>
              <GoogleSignInButton onError={setSubmitError} />
              <AuthDivider />
            </>
          )}

          {!minimal && resetSuccess ? (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-sm px-3 py-2 mb-4">
              {t('auth.resetPassword.successLogin')}
            </p>
          ) : null}

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
              <div className="flex items-center justify-between gap-2">
                <label className="block text-sm font-semibold">
                  {t('auth.login.password')}
                </label>
                {minimal ? null : (
                  <Link
                    href="/forgot-password"
                    className="text-xs text-orange-600 font-semibold hover:underline"
                  >
                    {t('auth.login.forgotPasswordLink')}
                  </Link>
                )}
              </div>
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

          {minimal ? null : (
            <div className="text-center mt-4 text-sm text-gray-600">
              {t('auth.login.noAccount')}
              <Link href="/signup" className="text-orange-600 font-semibold ml-1">
                {t('auth.login.signupLink')}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function LoginForm({
  defaultRedirect = '/',
  minimal = false,
}: LoginFormProps) {
  return (
    <Suspense fallback={null}>
      <LoginFormInner defaultRedirect={defaultRedirect} minimal={minimal} />
    </Suspense>
  );
}
