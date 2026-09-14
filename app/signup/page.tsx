import { notFound } from 'next/navigation';
import { SignupForm } from '@/components/auth/SignupForm';
import { PUBLIC_BOARD } from '@/lib/auth/public-board';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { createTranslator } from '@/lib/i18n/translate';
import { getMessages } from '@/messages';

/** 新規登録 `/signup`。本体は SignupForm。 */
export default function SignupPage() {
  if (PUBLIC_BOARD) notFound();

  const messages = getMessages(DEFAULT_LOCALE);
  const t = createTranslator(messages);

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold mb-2">
          {t('auth.signup.title')}
        </h1>
        <p className="text-quiet">
          {t('auth.signup.subtitle', { name: messages.app.name })}
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
