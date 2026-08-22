'use client';

/** ログイン `/login`。本体は LoginForm。 */
import { LoginForm } from '@/components/auth/LoginForm';
import { useTranslations } from '@/components/providers/LocaleProvider';

export default function LoginPage() {
  const { t } = useTranslations();

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black mb-2 -rotate-1 inline-block hand-title">
          {t('auth.login.title')}
        </h1>
        <p className="text-[#6a5344]">{t('auth.login.subtitle')}</p>
      </div>
      <LoginForm />
    </div>
  );
}
