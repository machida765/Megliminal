'use client';

/** 新規登録 `/signup`。本体は SignupForm。 */
import { SignupForm } from '@/components/auth/SignupForm';
import { useTranslations } from '@/components/providers/LocaleProvider';

export default function SignupPage() {
  const { t, messages } = useTranslations();

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black mb-2 rotate-1 inline-block hand-title">
          {t('auth.signup.title')}
        </h1>
        <p className="text-[#6a5344]">
          {t('auth.signup.subtitle', { name: messages.app.name })}
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
