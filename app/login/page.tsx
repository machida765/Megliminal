import { notFound } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { PUBLIC_BOARD } from '@/lib/auth/public-board';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { getMessages } from '@/messages';

/** ログイン `/login`。本体は LoginForm。 */
export default function LoginPage() {
  if (PUBLIC_BOARD) notFound();

  const messages = getMessages(DEFAULT_LOCALE);

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold mb-2">
          {messages.auth.login.title}
        </h1>
        <p className="text-quiet">{messages.auth.login.subtitle}</p>
      </div>
      <LoginForm />
    </div>
  );
}
