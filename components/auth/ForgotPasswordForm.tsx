'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';

export function ForgotPasswordForm() {
  const { t } = useTranslations();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage(t('auth.forgotPassword.errorRequired'));
      return;
    }

    setIsSubmitting(true);
    const result = await requestPasswordReset(email.trim());
    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('auth.forgotPassword.sentTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-quiet">
          <p>{t('auth.forgotPassword.sentBody')}</p>
          <Link href="/login" className="text-orange-600 font-semibold underline underline-offset-2">
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('auth.forgotPassword.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-quiet mb-4">{t('auth.forgotPassword.subtitle')}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold">{t('auth.login.email')}</label>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
            />
          </div>

          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting
              ? t('auth.forgotPassword.submitting')
              : t('auth.forgotPassword.submit')}
          </Button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          <Link href="/login" className="text-orange-600 font-semibold">
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
