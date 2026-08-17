'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';

function SignupFormInner() {
  const router = useRouter();
  const { t } = useTranslations();
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
      setErrorMessage(t('auth.signup.errorRequired'));
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage(t('auth.signup.errorPasswordLength'));
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setErrorMessage(t('auth.signup.errorPasswordMismatch'));
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
        <CardTitle>{t('auth.signup.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <GoogleSignInButton onError={setErrorMessage} />
        <AuthDivider />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold">{t('auth.signup.username')}</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('auth.signup.displayNamePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold">{t('auth.login.email')}</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold">{t('auth.login.password')}</label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('auth.signup.passwordMinPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold">
              {t('auth.signup.passwordConfirm')}
            </label>
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
            {isSubmitting ? t('auth.signup.submitting') : t('auth.signup.submit')}
          </Button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          {t('auth.signup.hasAccount')}
          <Link href="/login" className="text-orange-600 font-semibold ml-1">
            {t('auth.signup.loginLink')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export function SignupForm() {
  return (
    <Suspense fallback={null}>
      <SignupFormInner />
    </Suspense>
  );
}
