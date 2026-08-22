'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';

export function ResetPasswordForm() {
  const router = useRouter();
  const { t } = useTranslations();
  const { updatePassword, user, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-8">{t('common.loading')}</div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4 text-sm text-[#6a5344]">
          <p>{t('auth.resetPassword.sessionRequired')}</p>
          <Link href="/forgot-password" className="text-orange-600 font-semibold underline underline-offset-2">
            {t('auth.forgotPassword.title')}
          </Link>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!password || !passwordConfirm) {
      setErrorMessage(t('auth.resetPassword.errorRequired'));
      return;
    }
    if (password.length < 6) {
      setErrorMessage(t('auth.signup.errorPasswordLength'));
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage(t('auth.signup.errorPasswordMismatch'));
      return;
    }

    setIsSubmitting(true);
    const result = await updatePassword(password);
    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    router.push('/login?reset=success');
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('auth.resetPassword.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[#6a5344] mb-4">{t('auth.resetPassword.subtitle')}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold">
              {t('auth.resetPassword.newPassword')}
            </label>
            <Input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.signup.passwordMinPlaceholder')}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold">
              {t('auth.signup.passwordConfirm')}
            </label>
            <Input
              type="password"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder={t('auth.signup.passwordMinPlaceholder')}
              autoComplete="new-password"
            />
          </div>

          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting
              ? t('auth.resetPassword.submitting')
              : t('auth.resetPassword.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
